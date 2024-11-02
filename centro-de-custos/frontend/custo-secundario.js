document.addEventListener('DOMContentLoaded', () => {
    loadAllData(); // Carregar todos os dados ao iniciar a página
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
    const { jsPDF } = window.jspdf; // Acessa o jsPDF
    const doc = new jsPDF();
    
    let tableData = [];
    const headers = [];

    // Pegar as cabeçalhas da tabela
    document.querySelectorAll('table thead tr th').forEach(th => {
        headers.push(th.innerText);
    });

    tableData.push(headers); // Adicionar cabeçalhas

    // Pegar os dados da tabela atualmente exibidos no `table-body`
    document.querySelectorAll('#table-body tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(td => {
            rowData.push(td.innerText); // Pega o texto de cada célula
        });
        tableData.push(rowData);
    });

    // Adicionar os dados ao PDF
    doc.autoTable({
        head: [headers],
        body: tableData.slice(1), // O primeiro é o cabeçalho
        startY: 10,
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
    });

    // Guardar o PDF com o nome 'custos-mes-selecionado.pdf'
    doc.save('custos-mes-selecionado.pdf');
}

