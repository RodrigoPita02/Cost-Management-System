const express = require('express');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(fileUpload());

router.post('/gerar-pdf', async (req, res) => {
    try {
        console.log("🔹 Recebendo dados do frontend:", req.body);
        console.log("🔹 Arquivos recebidos:", req.files);

        if (!req.files || !req.files.custos || !req.body.selectedYear || !req.body.pdfPaths) {
            console.error('❌ Faltando parâmetros:', {
                custos: !!req.files?.custos,
                selectedYear: req.body.selectedYear,
                selectedMonth: req.body.selectedMonth,
                pdfPaths: req.body.pdfPaths
            });
            return res.status(400).send('Arquivo de custos ou filtros não foram enviados corretamente.');
        }

        const selectedYear = req.body.selectedYear;
        const selectedMonth = req.body.selectedMonth;
        const pdfPaths = JSON.parse(req.body.pdfPaths);

        console.log(`📅 Ano: ${selectedYear}, Mês: ${selectedMonth ? selectedMonth : 'Todos os meses'}`);
        console.log(`📂 PDFs a anexar:`, pdfPaths);

        const custosFile = req.files.custos;
        const pdfDoc = await PDFDocument.load(custosFile.data);

        // Criar uma nova página no PDF para listar os anexos
        const page = pdfDoc.addPage([600, 800]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let yPosition = 750;

        page.drawText(`Documentos Anexados (${selectedYear}${selectedMonth ? `-${selectedMonth}` : ''}):`, { x: 50, y: yPosition, font, size: 16 });
        yPosition -= 20;

        const uploadDir = path.resolve(__dirname, '../uploads');

        if (pdfPaths.length === 0) {
            console.warn(`⚠️ Nenhum PDF foi encontrado para os registros filtrados.`);
            return res.status(404).send(`Nenhum PDF correspondente aos dados filtrados foi encontrado.`);
        }

        for (const pdfPath of pdfPaths) {
            const filePath = path.join(uploadDir, pdfPath);

            if (fs.existsSync(filePath)) {
                const pdfBytes = fs.readFileSync(filePath);
                await pdfDoc.attach(pdfBytes, pdfPath, { mimeType: 'application/pdf' });

                // Adicionar o nome do arquivo à nova página
                page.drawText(`- ${pdfPath}`, { x: 60, y: yPosition, font, size: 12 });
                yPosition -= 20;

                console.log(`✔ PDF anexado: ${pdfPath}`);
            } else {
                console.warn(`⚠️ Arquivo não encontrado: ${pdfPath}`);
            }
        }

        // Gerar o novo PDF
        const pdfBytesFinal = await pdfDoc.save();

        res.setHeader('Content-Disposition', `attachment; filename=custos-embutido-${selectedYear}${selectedMonth ? `-${selectedMonth}` : ''}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.end(pdfBytesFinal);

        console.log(`✅ PDF gerado com anexos e enviado para download.`);
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        res.status(500).send('Erro ao gerar PDF.');
    }
});

module.exports = router;