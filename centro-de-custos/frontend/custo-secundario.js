document.addEventListener('DOMContentLoaded', () => {
    loadAllData(); // Carregar todos os dados ao iniciar a página
    populateYearSelect();
    const searchButton = document.querySelector('button[type="button"]');
    const showAllButton = document.querySelector('button:nth-of-type(2)'); // Assume que o segundo botão é o "Mostrar Todos"
    const monthInput = document.getElementById('month');

    if (searchButton && showAllButton && monthInput) {
        searchButton.addEventListener('click', handleSearch);
        showAllButton.addEventListener('click', loadAllData); // Adicionar evento ao botão "Mostrar Todos"
    } else {
        console.error('Elemento(s) não encontrado(s): searchButton, showAllButton ou monthInput.');
    }
});

function populateYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    
    for (let i = currentYear; i >= currentYear - 10; i--) {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

function showAllData() {
    loadAllData(); // Recarregar todos os dados
}

function handleSearch() {
    const monthInput = document.getElementById('month');
    const month = monthInput.value;
    console.log('Valor do input mês:', month); // Adiciona um log para verificar o valor
    if (month) {
        filterByMonth(month);
    } else {
        console.error('Nenhum mês selecionado.');
    }
}

// Função para filtrar os dados por mês
function filterByMonth(month) {
    try {
        // Verificar se o formato do mês está correto
        if (!/^\d{4}-\d{2}$/.test(month)) {
            throw new Error('Formato de mês inválido. Verifique se o valor é YYYY-MM.');
        }

        // Extrair ano e mês
        const [year, monthStr] = month.split('-');
        if (!year || !monthStr) {
            throw new Error('Ano ou mês não fornecido.');
        }

        // Construir a URL da API
        const url = `/api/custo-secundario?year=${year}&month=${monthStr}`;

        // Fazer a requisição para a API
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos:', data);
                // Aplicar o filtro local se necessário
                const filteredData = data.filter(item => {
                    const itemMonth = new Date(item.data).toISOString().slice(0, 7); // YYYY-MM
                    return itemMonth === month;
                });
                console.log('Dados filtrados:', filteredData);
                // Atualizar a tabela com os dados filtrados
                populateCustoSecundarioTable(filteredData);
            })
            .catch(error => console.error('Erro ao buscar custos secundários:', error));
    } catch (error) {
        console.error('Erro na função filterByMonth:', error);
    }
}

// Função para popular a tabela com os dados
function populateCustoSecundarioTable(data) {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) {
        console.error('Elemento com id "table-body" não encontrado.');
        return;
    }
    tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.descricao}</td>
            <td>${item.data.split('T')[0]}</td>
            <td>€ ${item.valor}</td>
            <td>${item.data_pagamento.split('T')[0]}</td>
            <td>${item.pdf_path ? `<a href="/uploads/${item.pdf_path}" target="_blank">${item.pdf_path.split('/').pop()}</a>` : 'Nenhum PDF'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Função para carregar todos os dados
function loadAllData() {
    fetch('/api/custo-secundario')
        .then(response => response.json())
        .then(data => {
            console.log('Dados recebidos:', data);
            populateCustoSecundarioTable(data);
        })
        .catch(error => console.error('Erro ao carregar dados:', error));
}

function exportTableToPDF() {
    const selectedYear = document.getElementById('yearSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value; // Novo filtro por mês

    let apiUrl = `/api/custo-secundario?year=${selectedYear}`;
    if (selectedMonth) {
        apiUrl += `&month=${selectedMonth}`;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert(`Nenhum dado encontrado para ${selectedMonth ? `o mês ${selectedMonth} de` : ''} ${selectedYear}`);
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const headers = ['ID', 'Descrição', 'Data', 'Valor', 'Data de Pagamento', 'PDF'];
            let tableData = [];

            // Preparar os dados para a tabela
            data.forEach(item => {
                let pdfFileName = '';
                let pdfUrl = '';

                if (item.pdf_path) {
                    pdfFileName = item.pdf_path.split('/').pop(); // Obtém o nome do arquivo
                    pdfUrl = `http://localhost:3000/uploads/${item.pdf_path}`;
                }

                tableData.push([
                    item.id,
                    item.descricao,
                    item.data.split('T')[0],
                    `€ ${item.valor}`,
                    item.data_pagamento ? item.data_pagamento.split('T')[0] : 'N/A',
                    pdfUrl ? { name: pdfFileName, url: pdfUrl } : '' // Evita inserir o nome do arquivo na tabela
                ]);
            });

            // Criar a tabela no PDF com alinhamento central
            doc.autoTable({
                head: [headers],
                body: tableData.map(row => row.map((cell, colIndex) => (colIndex === 5 ? '' : cell))), // Mantém a célula do PDF vazia antes de inserir os links
                startY: 10,
                styles: { fontSize: 10, cellPadding: 3, halign: 'center' },
                headStyles: { halign: 'center' },
                columnStyles: { 5: { halign: 'center' } }, // Centraliza a coluna do PDF
                didDrawCell: function (data) {
                    if (data.section === 'body' && data.column.index === 5) { // Certifica-se de que não está no cabeçalho
                        const rowIndex = data.row.index;
                        const pdfInfo = tableData[rowIndex][5]; // Obtém o nome e link do PDF

                        if (typeof pdfInfo === 'object' && pdfInfo.url) {
                            doc.setTextColor(0, 0, 255);
                            const textWidth = doc.getTextWidth(pdfInfo.name);
                            const xCentered = data.cell.x + (data.cell.width - textWidth) / 2;
                            doc.textWithLink(pdfInfo.name, xCentered, data.cell.y + 4, { url: pdfInfo.url });
                            doc.setTextColor(0, 0, 0);
                        }
                    }
                }
            });

            const fileName = `custos-${selectedYear}${selectedMonth ? `-${selectedMonth}` : ''}.pdf`;
            doc.save(fileName);
        })
        .catch(error => console.error('Erro ao buscar custos:', error));
}