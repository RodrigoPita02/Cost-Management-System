document.addEventListener('DOMContentLoaded', function() {
    populateSelects();
    fetchCustoVariavel(); // Carrega os dados ao iniciar

    document.getElementById('custoVariavelForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addCustoVariavel();
    });

    document.getElementById('pesquisaForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Evita a atualização da página
        filtrarCustosVariaveis();
    });
});

function filtrarCustosVariaveis() {
    const descricao = document.getElementById('pesquisaDescricao').value.trim();
    const data = document.getElementById('pesquisaData').value;
    fetchCustoVariavel(descricao, data);
}

function limparFiltro() {
    document.getElementById('pesquisaDescricao').value = '';
    document.getElementById('pesquisaData').value = '';
    fetchCustoVariavel(); // Buscar todos os dados novamente
}

function populateSelects() {
    fetch('/api/descriptions')
        .then(response => response.json())
        .then(data => {
            const tipoPagamentoSelect = document.getElementById('tipo_pagamento');
            const situacaoSelect = document.getElementById('situacao');

            tipoPagamentoSelect.innerHTML = '';
            situacaoSelect.innerHTML = '';

            data.tipoPagamento.forEach(item => {
                tipoPagamentoSelect.add(new Option(item.descricao, item.id));
            });

            data.situacao.forEach(item => {
                situacaoSelect.add(new Option(item.descricao, item.id));
            });
        })
        .catch(error => console.error('Error fetching descriptions:', error));
}

function addCustoVariavel() {
    const form = document.getElementById('custoVariavelForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.data || !data.descricao || !data.valor || !data.tipo_pagamento || !data.situacao) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    data.valor = parseFloat(data.valor).toFixed(2);

    fetch('/api/custo-variavel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) throw new Error('Error adding variable cost');
        return response.json();
    })
    .then(() => {
        fetchCustoVariavel(); // Atualiza a tabela após o envio do formulário
        form.reset();
    })
    .catch(error => console.error('Error adding cost:', error));
}

function fetchCustoVariavel(descricao = '', data = '') {
    let url = `/api/custo-variavel?descricao=${encodeURIComponent(descricao)}&data=${encodeURIComponent(data)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos:', data);
            const tableBody = document.querySelector('#custoVariavelTable tbody');
            tableBody.innerHTML = '';

            data.forEach(item => {
                const valor = parseFloat(item.valor) || 0;
                const dataFormatada = formatDate(item.data);
                const dataPagamentoFormatada = formatDate(item.data_pagamento);

                const pdfUrl = item.pdf_path ? `/uploads/${item.pdf_path}` : '#';
                const pdfDisplay = item.pdf_path ? `<a href="${pdfUrl}" target="_blank">${item.pdf_path.split('/').pop()}</a>` : 'Nenhum PDF';

                const delete_btn = `<button onclick="deleteCustoVariavel(${item.id})">Delete</button>`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${dataFormatada}</td>
                    <td>${item.descricao}</td>
                    <td>€ ${valor.toFixed(2)}</td>
                    <td>${item.tipo_pagamento_descricao || 'N/A'}</td>
                    <td>${item.situacao_descricao || 'N/A'}</td>
                    <td>${dataPagamentoFormatada || 'N/A'}</td>
                    <td>
                        <input type="file" id="upload-${item.id}" data-id="${item.id}" class="upload-pdf" accept="application/pdf"/>
                        <button onclick="uploadPDF(${item.id})" class="upload-btn">Upload PDF</button>
                    </td>
                    <td>${pdfDisplay}</td>
                    <td>${delete_btn}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao buscar custos variáveis:', error));
}

function deleteCustoVariavel(id) {
    if (confirm('Deseja mesmo apagar este custo?')) {
        fetch(`/api/custo-variavel/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao apagar o custo');
            }
            return response.json();
        })
        .then(() => {
            alert('Custo apagado com sucesso');
            fetchCustoVariavel(); // Recarregar a tabela sem atualizar a página
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

function uploadPDF(custoId) {
    const fileInput = document.getElementById(`upload-${custoId}`);
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('pdf', file);
        
        fetch(`/api/custo-variavel/${custoId}/upload-pdf`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao enviar o PDF');
            return response.json();
        })
        .then(() => {
            alert('PDF enviado com sucesso.');
            fetchCustoVariavel(); // Atualiza a tabela após o upload
        })
        .catch(error => {
            console.error('Error uploading PDF:', error);
            alert('Erro ao enviar o PDF.');
        });
    } else {
        alert('Por favor, selecione um arquivo PDF para enviar.');
    }
}
