document.addEventListener('DOMContentLoaded', function() {
    fetchDescriptions();

    document.getElementById('descriptionForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Previne o envio padrão do formulário
        addDescription();
    });

    // Adiciona evento de entrada ao campo de pesquisa
    const searchInput = document.getElementById('searchDescription');
    if (searchInput) {
        searchInput.addEventListener('input', filterDescriptions);
    }
});

function fetchDescriptions() {
    fetch('/api/manage-descriptions')
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                populateDescriptionTable(data);
            } else {
                console.error('Formato inesperado dos dados de descrição:', data);
            }
        })
        .catch(error => console.error('Error fetching descriptions:', error));
}

function populateDescriptionTable(descricoes) {
    const tableBody = document.querySelector('#descriptionTable tbody');
    if (!tableBody) {
        console.error('Elemento de tabela não encontrado');
        return;
    }
    
    tableBody.innerHTML = ''; // Limpa a tabela existente
    
    descricoes.forEach(item => {
        const status = item.ativo ? 'Ativo' : 'Desativado'; // Determina o status baseado no campo `ativo`
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.tipo}</td>
            <td>${item.nome}</td>
            <td>${status}</td> <!-- Adiciona a coluna de status -->
            <td>
                ${item.ativo 
                    ? `<button onclick="deactivateDescription(${item.id})">Desativar</button>` 
                    : `<button onclick="reactivateDescription(${item.id})">Reativar</button>`
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addDescription() {
    const form = document.getElementById('descriptionForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    fetch('/api/manage-descriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao adicionar descrição');
        return response.json();
    })
    .then(() => {
        fetchDescriptions(); // Atualiza a lista de descrições
        form.reset(); // Limpa o formulário
    })
    .catch(error => console.error('Error adding description:', error));
}

function deactivateDescription(id) {
    fetch(`/api/manage-descriptions/${id}/deactivate`, {
        method: 'PUT'
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao desativar descrição');
        return response.json();
    })
    .then(() => {
        fetchDescriptions(); // Atualiza a lista de descrições
    })
    .catch(error => console.error('Error deactivating description:', error));
}

function reactivateDescription(id) {
    fetch(`/api/manage-descriptions/${id}/reactivate`, {
        method: 'PUT'
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao reativar descrição');
        return response.json();
    })
    .then(() => {
        fetchDescriptions(); // Atualiza a lista de descrições
    })
    .catch(error => console.error('Error reactivating description:', error));
}

function filterDescriptions() {
    const searchInput = document.getElementById('searchDescription').value.toLowerCase();
    const tableRows = document.querySelectorAll('#descriptionTable tbody tr');

    tableRows.forEach(row => {
        const nameCell = row.querySelector('td:nth-child(2)'); // Segunda coluna é o nome
        const name = nameCell.textContent.toLowerCase();

        if (name.includes(searchInput)) {
            row.style.display = ''; // Mostra a linha
        } else {
            row.style.display = 'none'; // Oculta a linha
        }
    });
}
