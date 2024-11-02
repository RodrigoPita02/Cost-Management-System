document.addEventListener('DOMContentLoaded', () => {
    const mergeButton = document.getElementById('mergeButton');
    mergeButton.addEventListener('click', mergePDFs);
});

async function mergePDFs() {
    const fileA = document.getElementById('pdfFileA').files[0];
    const fileB = document.getElementById('pdfFileB').files[0];

    if (!fileA || !fileB) {
        alert('Por favor, selecione dois arquivos PDF.');
        return;
    }

    try {
        // Carregar os documentos PDF
        const pdfBytesA = await fileA.arrayBuffer();
        const pdfBytesB = await fileB.arrayBuffer();
        
        const pdfDocA = await PDFLib.PDFDocument.load(pdfBytesA);
        const pdfDocB = await PDFLib.PDFDocument.load(pdfBytesB);
        
        // Criar um novo documento PDF para a fusão
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        // Copiar páginas do primeiro PDF e adicionar ao novo PDF
        const pagesA = await mergedPdf.copyPages(pdfDocA, pdfDocA.getPageIndices());
        pagesA.forEach(page => mergedPdf.addPage(page));
        
        // Copiar páginas do segundo PDF e adicionar ao novo PDF
        const pagesB = await mergedPdf.copyPages(pdfDocB, pdfDocB.getPageIndices());
        pagesB.forEach(page => mergedPdf.addPage(page));
        
        // Salvar o PDF combinado
        const mergedPdfBytes = await mergedPdf.save();
        const downloadLink = URL.createObjectURL(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
        
        // Mostrar mensagem de sucesso e botão para download
        document.getElementById('successMessage').classList.remove('hidden');
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.classList.remove('hidden');
        downloadButton.onclick = () => window.open(downloadLink);
    } catch (error) {
        console.error('Erro ao combinar PDFs:', error);
        alert('Ocorreu um erro ao combinar os PDFs. Verifique os arquivos e tente novamente.');
    }
}
