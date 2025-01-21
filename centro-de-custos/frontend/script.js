// Variáveis globais para armazenar os gráficos
let costDistributionChart = null;
let costBarChart = null;

document.addEventListener('DOMContentLoaded', function () {
    populateSelects();
    fetchData();
    fetchPendingCostsCount();
    fetchTotalGastos();
    fetchCostDistribution();

    const searchButton = document.getElementById('searchButton');
    const showAllButton = document.getElementById('showAllButton');

    searchButton.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput').value;
        const searchCategory = document.getElementById('searchCategory').value;
        const monthInput = document.getElementById('month-custo').value;

        fetchData(searchInput, searchCategory, monthInput);
    });

    showAllButton.addEventListener('click', () => {
        this.location.reload();
    });

    document.getElementById('pendingCostsButton').addEventListener('click', function () {
        console.log('Botão de custos por pagar clicado');
        fetchData(true);
    });

    document.getElementById('showAllButton').addEventListener('click', function () {
        console.log('Botão Mostrar Todos clicado');
        fetchData();
    });

    document.getElementById('searchButton').addEventListener('click', function () {
        console.log('Botão de pesquisa clicado');
        fetchData();
    });

    document.getElementById('searchInput').addEventListener('input', function () {
        console.log('Campo de pesquisa alterado');
        fetchData();
    });

    document.getElementById('searchCategory').addEventListener('change', function () {
        console.log('Categoria selecionada alterada');
        fetchData();
    });

    document.getElementById('updateChartButton').addEventListener('click', () => {
        const selectedMonth = document.getElementById('monthSelect').value;
        fetchCostDistribution(selectedMonth);
    });
});

function fetchPendingCostsCount() {
    fetch('/api/custos-por-pagar-count')
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            const pendingCostsCountElement = document.getElementById('pendingCostsCount');
            pendingCostsCountElement.textContent = data.count || '0';
        })
        .catch(error => console.error('Error fetching pending costs count:', error));
}

function fetchTotalGastos() {
    fetch('/api/total-gastos')
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            const totalGastosElement = document.getElementById('totalGastos');
            const totalValue = typeof data.total === 'number' ? data.total : 0; // Verifica se é um número
            totalGastosElement.textContent = `€ ${totalValue.toFixed(2)}`; // Formata para duas casas decimais
        })
        .catch(error => console.error('Error fetching total gastos:', error));
}

function fetchData(filterPending = false) {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchCategory = document.getElementById('searchCategory').value.trim();
    const monthInput = document.getElementById('monthInput').value.trim(); // Campo para a data/mês

    let url = filterPending ? '/api/custos-por-pagar' : '/api/custos';
    const params = new URLSearchParams();

    if (searchInput) params.append('search', searchInput);
    if (searchCategory) params.append('category', searchCategory);
    if (monthInput) params.append('month', monthInput); // Adiciona o filtro de mês

    // Se houver parâmetros, adiciona-os à URL
    if (params.toString()) url += '?' + params.toString();

    console.log('Fetching data from URL:', url);

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos para custos:', data);
            const tableBody = document.querySelector('#custoTable tbody');
            tableBody.innerHTML = '';

            fetch('/api/descriptions')
                .then(response => {
                    if (!response.ok) throw new Error('Erro na resposta do servidor');
                    return response.json();
                })
                .then(descriptions => {
                    console.log('Dados recebidos para descrições:', descriptions);

                    let activeDescriptions = new Set();

                    if (Array.isArray(descriptions)) {
                        // Se for um array
                        activeDescriptions = new Set(descriptions.filter(desc => desc.ativo).map(desc => desc.id));
                    } else if (typeof descriptions === 'object' && descriptions !== null) {
                        // Se for um objeto, verifique se contém a chave que poderia armazenar as descrições
                        for (const key in descriptions) {
                            if (Array.isArray(descriptions[key])) {
                                activeDescriptions = new Set(descriptions[key].filter(desc => desc.ativo).map(desc => desc.id));
                                break;
                            }
                        }
                    } else {
                        console.error('Formato de dados inesperado para descrições:', descriptions);
                        throw new Error('Formato de dados inesperado para descrições');
                    }

                    populateTable(data, activeDescriptions);
                })
                .catch(error => console.error('Error fetching descriptions for filter:', error));
        })
        .catch(error => console.error('Error fetching costs:', error));
}


function populateTable(data, activeDescriptions = new Set()) {
    const tableBody = document.querySelector('#custoTable tbody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        if (activeDescriptions.has(item.descricao_id) || activeDescriptions.size === 0) {
            const valor = parseFloat(item.valor) || 0;
            const dataFormatada = formatDate(item.data);
            const dataPagamentoFormatada = formatDate(item.data_pagamento);

            const uploadButton = `
                <input type="file" id="upload-${item.id}" data-id="${item.id}" class="upload-pdf" accept="application/pdf"/>
                <button onclick="uploadPDF(${item.id})">Upload</button>
            `;
            const pdfUrl = item.pdf_path ? `${item.pdf_path}` : '#';
            const pdfDisplay = item.pdf_path ? `<a href="${pdfUrl}" target="_blank">${item.pdf_name}</a>` : 'Nenhum PDF';

            // Botão de delete
            const deleteButton = `<button class="action-button" onclick="deleteCusto(${item.id})">Apagar Custo</button>`;

            const updateButton = `<button class="action-button" onclick="updateSituacao(${item.id}, '${item.situacao_id}')">Atualizar Situação</button>`;

            const row = document.createElement('tr');
            row.setAttribute('id', `row-${item.id}`); // Aqui o ID da linha
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${dataFormatada}</td>
                <td>${item.tipo}</td>
                <td>${item.descricao_nome || 'N/A'}</td>
                <td>€ ${valor.toFixed(2)}</td>
                <td>${item.tipo_pagamento_descricao}</td>
                <td>${item.situacao_descricao}</td>
                <td>${dataPagamentoFormatada || 'N/A'}</td>
                <td>${uploadButton}</td>
                <td>${pdfDisplay}</td>
                <td>${updateButton} ${deleteButton}</td> <!-- Adicionado botão de delete -->
            `;
            tableBody.appendChild(row);
        }
    });
}

function updateSituacao(id, situacaoId) {
    // Define o novo estado da situação
    const newSituacaoId = situacaoId === '1' ? '2' : '1'; // Alterna entre 1 (pago) e 2 (por pagar)

    fetch(`/api/custos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ situacao_id: newSituacaoId }), // Envia o novo ID da situação
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar a situação.');
            }
            return response.json();
        })
        .then(data => {
            alert('Situação atualizada com sucesso!');
            // Recarregar a tabela após a atualização
            location.reload(); // Recarrega a página
        })
        .catch(error => {
            console.error('Erro ao atualizar situação:', error);
            alert('Erro ao atualizar a situação.');
        });
}

function deleteCusto(id) {
    if (confirm('Deseja mesmo apagar este custo?')) {
        fetch(`/api/custos/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao apagar o custo');
                }
                return response.json();
            })
            .then(data => {
                alert('Custo apagado com sucesso');
                // Recarregar a tabela ou remover a linha da tabela
                location.reload(); // Recarrega a página
            })
            .catch(error => {
                console.error('Erro ao apagar custo:', error);
                alert('Erro ao apagar custo: ' + error.message);
            });
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

function populateSelects() {
    fetch('/api/descriptions') // Certifique-se de que o endpoint está correto
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos para descrições:', data);

            // Verifique se data é um objeto e contém os campos esperados
            if (typeof data !== 'object' || !data) {
                throw new Error('Formato de dados inesperado: data não é um objeto');
            }

            const { descricao = [], tipoPagamento = [], situacao = [] } = data;

            if (!Array.isArray(descricao) || !Array.isArray(tipoPagamento) || !Array.isArray(situacao)) {
                throw new Error('Formato de dados inesperado: um ou mais campos não são arrays');
            }

            const tipoSelect = document.getElementById('tipo');
            const descricaoInput = document.getElementById('descricao');
            const descricaoDatalist = document.getElementById('descricaoList'); // Para autocomplete
            const tipoPagamentoSelect = document.getElementById('tipo_pagamento');
            const situacaoSelect = document.getElementById('situacao');

            // Limpar selects e datalist antes de adicionar novas opções
            tipoSelect.innerHTML = '';
            descricaoDatalist.innerHTML = ''; // Para o datalist
            tipoPagamentoSelect.innerHTML = '';
            situacaoSelect.innerHTML = '';

            // Preencher tipoPagamento
            tipoPagamento.forEach(item => {
                if (item.descricao && item.id) {
                    tipoPagamentoSelect.add(new Option(item.descricao, item.id));
                }
            });

            // Preencher situacao
            situacao.forEach(item => {
                if (item.descricao && item.id) {
                    situacaoSelect.add(new Option(item.descricao, item.id));
                }
            });

            // Preencher tipo
            const tipos = ['Banco', 'Funcionarios', 'Fornecedores', 'Servicos', 'Estado'];
            tipos.forEach(tipo => {
                tipoSelect.add(new Option(tipo, tipo));
            });

            // Atualizar opções de descrição no datalist com base no tipo selecionado
            tipoSelect.addEventListener('change', function () {
                descricaoDatalist.innerHTML = '';
                const tipo = this.value;

                // Filtrar descrições ativas e do tipo selecionado
                // Preencher o datalist de descrições com IDs
                descricao
                    .filter(item => item.tipo === tipo && item.ativo) // Filtra descrições ativas do tipo selecionado
                    .forEach(item => {
                        if (item.nome && item.id) {
                            const option = document.createElement('option');
                            option.value = item.nome; // Texto exibido no datalist
                            option.setAttribute('data-id', item.id); // ID associado
                            descricaoDatalist.appendChild(option);
                        }
                    });

            });

            // Acionar evento inicial para preencher as opções
            tipoSelect.dispatchEvent(new Event('change'));

            // Definir valores predefinidos, se necessário
            const defaultTipo = 'Banco'; // Exemplo de valor padrão
            tipoSelect.value = defaultTipo;
            tipoSelect.dispatchEvent(new Event('change'));

            // Verificar se os arrays existem e têm pelo menos um item antes de definir os valores
            tipoPagamentoSelect.value = (tipoPagamento[0]?.id) || ''; // Ajuste conforme necessário
            situacaoSelect.value = (situacao[0]?.id) || ''; // Ajuste conforme necessário
        })
        .catch(error => console.error('Erro ao buscar descrições:', error));
}

function addCusto(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    const form = document.getElementById('custoForm');
    const formData = new FormData(form);

    // Captura o valor da descrição e tenta encontrar o ID correspondente
    const descricaoInput = document.getElementById('descricao'); // Campo de entrada
    const descricaoSelecionada = descricaoInput.value.trim(); // Valor digitado ou selecionado
    const descricaoList = Array.from(document.getElementById('descricaoList').options); // Opções do datalist

    // Buscar o ID correspondente ao valor digitado
    const descricaoId = descricaoList.find(option => option.value.trim() === descricaoSelecionada)?.getAttribute('data-id');

    if (!descricaoId) {
        alert('Por favor, selecione uma descrição válida da lista.');
        return;
    }

    // Captura os valores do formulário
    const data = {
        data: formData.get('data'),
        tipo: formData.get('tipo'),
        descricao_id: descricaoId, // Usa o ID encontrado
        valor: parseFloat(formData.get('valor')),
        tipo_pagamento_id: formData.get('tipo_pagamento_id'),
        situacao_id: formData.get('situacao_id'),
        data_pagamento: formData.get('data_pagamento')
    };

    // Verifica se todos os campos estão preenchidos
    if (!data.data || !data.tipo || isNaN(data.valor) || !data.tipo_pagamento_id || !data.situacao_id || !data.data_pagamento) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    // Envia os dados para o servidor
    fetch('/api/custos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao adicionar custo');
        return response.json();
    })
    .then(() => {
        fetchData();
        fetchPendingCostsCount();
        fetchCostDistribution();
        form.reset();
    })
    .catch(error => console.error('Erro ao adicionar custo:', error));
}

function fetchCostDistribution(month = '') {
    const url = month ? `/api/custos/distribution?month=${month}` : '/api/custos/distribution';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                renderChart(data);
                renderBarChart(data); // Atualiza o gráfico de barras
            } else {
                console.error('Expected an array but got:', data);
            }
        })
        .catch(error => console.error('Error fetching cost distribution:', error));
}

function renderChart(data) {
    const ctx = document.getElementById('costDistributionChart').getContext('2d');

    // Destroi o gráfico anterior, se existir, para evitar sobreposição
    if (costDistributionChart) {
        costDistributionChart.destroy();
    }

    // Cria o novo gráfico de rosca
    costDistributionChart = new Chart(ctx, {
        type: 'doughnut', // Alterado para gráfico de rosca
        data: {
            labels: data.map(item => item.tipo),
            datasets: [{
                label: 'Distribuição dos Custos',
                data: data.map(item => item.total),
                backgroundColor: [
                    '#007bff',
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ],
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#007bff',
                    borderWidth: 1
                }
            },
            cutout: '40%', // Aumenta o buraco no meio do gráfico de rosca para um efeito moderno
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function renderBarChart(data) {
    const ctx = document.getElementById('costBarChart').getContext('2d');

    // Destroi o gráfico anterior, se existir, para evitar sobreposição
    if (costBarChart) {
        costBarChart.destroy();
    }

    // Cria o novo gráfico de barras
    costBarChart = new Chart(ctx, {
        type: 'bar', // Tipo de gráfico de barras
        data: {
            labels: data.map(item => item.tipo),
            datasets: [{
                label: 'Total de Custos',
                data: data.map(item => item.total),
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#007bff',
                    borderWidth: 1
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function uploadPDF(custoId) {
    const fileInput = document.getElementById(`upload-${custoId}`);
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('pdf', file);
        const uploadButton = fileInput.nextElementSibling;
        uploadButton.disabled = true; // Desabilita o botão de upload durante o envio

        fetch(`/api/custos/${custoId}/upload-pdf`, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao enviar o PDF');
                return response.json();
            })
            .then(data => {
                console.log('PDF upload successful:', data);
                alert('PDF enviado com sucesso.');
                fetchData();
            })
            .catch(error => {
                console.error('Error uploading PDF:', error);
                alert('Erro ao enviar o PDF.');
            })
            .finally(() => {
                uploadButton.disabled = false; // Reabilita o botão após o upload
            });
    } else {
        alert('Por favor, selecione um arquivo PDF para enviar.');
    }
}

function handleCustoSearch() {
    const monthInput = document.getElementById('month-custo');
    const month = monthInput.value;

    if (month) {
        filterCustoByMonth(month);
    } else {
        console.error('Nenhum mês selecionado.');
    }
}

function filterCustoByMonth(month) {
    try {
        const [year, monthStr] = month.split('-');
        const url = `/api/custos?year=${year}&month=${monthStr}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
                return response.json();
            })
            .then(data => {
                populateTable(data);
            })
            .catch(error => console.error('Erro ao buscar custos:', error));
    } catch (error) {
        console.error('Erro ao filtrar custos por mês:', error);
    }
}

function loadAllCustoData() {
    fetch('/api/custos')
        .then(response => response.json())
        .then(data => {
            populateTable(data);
        })
        .catch(error => console.error('Erro ao carregar todos os dados:', error));
}
