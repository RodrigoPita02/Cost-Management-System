const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { PDFDocument, sortedUniq } = require('pdf-lib');
const multer = require('multer'); // Para lidar com uploads de arquivos
const fs = require('fs'); // Para manipulação de arquivos
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do diretório 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir arquivos PDF do diretório 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do multer para uploads de PDF
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            let newFilename;
            
            // Verifica a URL completa para decidir o prefixo
            if (req.originalUrl.includes('/custo-variavel/')) {
                // Para custos variáveis, adiciona 'CV_' ao nome do arquivo original
                newFilename = `CV_${file.originalname}`;
            } else {
                // Para custos normais, mantém o nome original do arquivo
                newFilename = file.originalname;
            }

            cb(null, newFilename);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

const uploadCusto = multer({ storage }).single('pdf');
const uploadCustoVariavel = multer({ storage }).single('pdf');

const upload = multer({ storage: storage });

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'centro_de_custos'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database.');
});

// Endpoint para obter todos os custos com filtragem opcional
app.get('/api/custos', (req, res) => {
    const { search, category, month } = req.query;

    // Extração de ano e mês do parâmetro 'month' (no formato 'yyyy-mm')
    let year = null;
    let monthOnly = null;
    
    if (month) {
        const [parsedYear, parsedMonth] = month.split('-');
        year = parsedYear;
        monthOnly = parsedMonth;
    }

    let sql = `
        SELECT c.id, c.data, c.tipo, c.descricao_id, c.valor, c.tipo_pagamento_id, c.situacao_id, c.data_pagamento,
               c.pdf_path, -- Inclui o caminho do PDF na resposta
               d.nome AS descricao_nome,
               tp.descricao AS tipo_pagamento_descricao,
               sit.descricao AS situacao_descricao
        FROM Custo c
        LEFT JOIN Descricao d ON c.descricao_id = d.id
        LEFT JOIN TipoPagamento tp ON c.tipo_pagamento_id = tp.id
        LEFT JOIN Situacao sit ON c.situacao_id = sit.id
    `;

    const filters = [];
    const params = [];

    // Filtro de pesquisa por descrição
    if (search) {
        filters.push('d.nome LIKE ?');
        params.push(`%${search}%`);
    }

    // Filtro por categoria
    if (category) {
        filters.push('c.tipo = ?');
        params.push(category);
    }

    // Filtro por ano e mês (se o parâmetro "month" for fornecido)
    if (year && monthOnly) {
        filters.push('YEAR(c.data) = ? AND MONTH(c.data) = ?');
        params.push(year, monthOnly);
    } else if (year) {
        filters.push('YEAR(c.data) = ?');
        params.push(year);
    }

    // Se houver filtros, adiciona-os à consulta SQL
    if (filters.length > 0) {
        sql += ' WHERE ' + filters.join(' AND ');
    }

    console.log('SQL:', sql); // Log da consulta SQL usada

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching costs:', err);
            res.status(500).json({ error: 'Error fetching costs' });
            return;
        }

        // Modifica o caminho do PDF para URL do endpoint de download
        results.forEach(result => {
            if (result.pdf_path) {
                result.pdf_path = `/uploads/${result.pdf_path}`;
                // Extraindo apenas o nome do arquivo
                result.pdf_name = result.pdf_path.split('/').pop(); // Pega o nome do arquivo do caminho
            }
        });

        res.json(results);
    });
});

// Endpoint para atualizar a situação de um custo
app.put('/api/custos/:id', (req, res) => {
    const { id } = req.params;
    const { situacao_id } = req.body;

    const sql = `UPDATE Custo SET situacao_id = ? WHERE id = ?`;
    db.query(sql, [situacao_id, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar a situação:', err);
            res.status(500).json({ error: 'Erro ao atualizar a situação' });
            return;
        }

        res.json({ message: 'Situação atualizada com sucesso', id });
    });
});

// Endpoint para apagar um custo
app.delete('/api/custos/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM Custo WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao apagar custo:', err);
            res.status(500).json({ error: 'Erro ao apagar custo' });
            return;
        }

        if (result.affectedRows > 0) {
            res.json({ message: 'Custo apagado com sucesso' });
        } else {
            res.status(404).json({ error: 'Custo não encontrado' });
        }
    });
});

// Endpoint para apagar um custoVariavel
app.delete('/api/custo-variavel/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM custovariavel WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao apagar custo:', err);
            res.status(500).json({ error: 'Erro ao apagar custo' });
            return;
        }

        if (result.affectedRows > 0) {
            res.json({ message: 'Custo apagado com sucesso' });
        } else {
            res.status(404).json({ error: 'Custo não encontrado' });
        }
    });
});

// Endpoint para obter custos por pagar
app.get('/api/custos-por-pagar', (req, res) => {
    const sql = `
        SELECT c.id, c.data, c.tipo, c.descricao_id, c.valor, c.tipo_pagamento_id, c.situacao_id, c.data_pagamento,
               c.pdf_path, -- Inclui o caminho do PDF na resposta
               d.nome AS descricao_nome,
               tp.descricao AS tipo_pagamento_descricao,
               sit.descricao AS situacao_descricao
        FROM Custo c
        LEFT JOIN Descricao d ON c.descricao_id = d.id
        LEFT JOIN TipoPagamento tp ON c.tipo_pagamento_id = tp.id
        LEFT JOIN Situacao sit ON c.situacao_id = sit.id
        WHERE sit.descricao = 'Por pagar';
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching costs:', err);
            res.status(500).json({ error: 'Error fetching costs' });
            return;
        }

        // Modifica o caminho do PDF para URL do endpoint de download
        results.forEach(result => {
            if (result.pdf_path) {
                result.pdf_path = `/uploads/${result.pdf_path}`;
            }
        });

        res.json(results);
    });
});

// Endpoint para obter a contagem de custos por pagar
app.get('/api/custos-por-pagar-count', (req, res) => {
    const sql = `
        SELECT COUNT(*) AS count
        FROM Custo c
        LEFT JOIN Situacao sit ON c.situacao_id = sit.id
        WHERE sit.descricao = 'Por pagar';
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching costs count:', err);
            res.status(500).json({ error: 'Error fetching costs count' });
            return;
        }
        res.json(results[0]);
    });
});

// Endpoint para obter o total de gastos
app.get('/api/total-gastos', (req, res) => {
    const sql = `
        SELECT SUM(valor) AS total
        FROM custo
        WHERE situacao_id = 1; -- Supondo que 1 representa os custos que estão pagos
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching total gastos:', err);
            res.status(500).json({ error: 'Error fetching total gastos' });
            return;
        }

        const total = results[0]?.total || 0; // Se não houver resultados, define total como 0
        res.json({ total: total ? parseFloat(total) : 0 }); // Garantindo que seja um número
    });
});


// Endpoint para obter todas as descrições, incluindo desativadas
app.get('/api/descriptions', (req, res) => {
    const queries = {
        descricao: 'SELECT * FROM Descricao',
        tipoPagamento: 'SELECT * FROM TipoPagamento',
        situacao: 'SELECT * FROM Situacao'
    };

    const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
            db.query(queries[key], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve({ key, results });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const data = {};
            results.forEach(result => {
                data[result.key] = result.results;
            });
            res.json(data);
        })
        .catch(error => {
            console.error('Error fetching descriptions:', error);
            res.status(500).json({ error: 'Error fetching descriptions' });
        });
});

// Endpoint para obter todas as descrições
app.get('/api/manage-descriptions', (req, res) => {
    const sql = 'SELECT * FROM Descricao';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching descriptions:', err);
            return res.status(500).json({ error: 'Error fetching descriptions' });
        }
        res.json(results);
    });
});

// Endpoint para desativar uma descrição
app.put('/api/manage-descriptions/:id/deactivate', (req, res) => {
    const descricaoId = req.params.id;
    const sql = 'UPDATE Descricao SET ativo = FALSE WHERE id = ?';

    db.query(sql, [descricaoId], (err) => {
        if (err) {
            console.error('Error deactivating description:', err);
            return res.status(500).json({ error: 'Error deactivating description' });
        }
        res.status(200).json({ message: 'Description deactivated' });
    });
});

// Endpoint para reativar uma descrição
app.put('/api/manage-descriptions/:id/reactivate', (req, res) => {
    const descricaoId = req.params.id;
    const sql = 'UPDATE Descricao SET ativo = TRUE WHERE id = ?';

    db.query(sql, [descricaoId], (err) => {
        if (err) {
            console.error('Error reactivating description:', err);
            return res.status(500).json({ error: 'Error reactivating description' });
        }
        res.status(200).json({ message: 'Description reactivated' });
    });
});

// Endpoint para adicionar uma nova descrição
app.post('/api/manage-descriptions', (req, res) => {
    const { tipo, nome } = req.body;
    const sql = 'INSERT INTO Descricao (tipo, nome) VALUES (?, ?)';
    db.query(sql, [tipo, nome], (err) => {
        if (err) {
            console.error('Error adding description:', err);
            return res.status(500).json({ error: 'Error adding description' });
        }
        res.status(201).json({ message: 'Description added successfully' });
    });
});

// Endpoint para adicionar um custo
app.post('/api/custos', (req, res) => {
    const { data, tipo, descricao_id, valor, tipo_pagamento_id, situacao_id, data_pagamento } = req.body;
    const sql = `
        INSERT INTO Custo (data, tipo, descricao_id, valor, tipo_pagamento_id, situacao_id, data_pagamento)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [data, tipo, descricao_id, valor, tipo_pagamento_id, situacao_id, data_pagamento], (err) => {
        if (err) {
            console.error('Error inserting cost:', err);
            res.status(500).json({ error: 'Error inserting cost' });
            return;
        }
        res.status(201).json({ message: 'Cost added' });
    });
});

// Endpoint para obter a distribuição dos custos
app.get('/api/custos/distribution', (req, res) => {
    const { month } = req.query;

    // Cria a query base
    let sql = `
        SELECT tipo, SUM(valor) AS total
        FROM Custo
    `;

    // Se o parâmetro 'month' estiver presente, filtra pelo mês
    if (month) {
        sql += ` WHERE MONTH(data) = ?`;
    }

    // Agrupar por tipo independente do filtro de mês
    sql += ` GROUP BY tipo`;

    // Executa a query com ou sem o parâmetro de mês
    db.query(sql, month ? [month] : [], (err, results) => {
        if (err) {
            console.error('Error fetching cost distribution:', err);
            res.status(500).json({ error: 'Error fetching cost distribution' });
            return;
        }
        res.json(results);
    });
});

// Endpoint para fazer o upload do PDF na tabela Custo
app.post('/api/custos/:id/upload-pdf', uploadCusto, (req, res) => {
    const custoId = req.params.id;

    console.log('Received request to upload PDF for custo ID:', custoId); // Log para depuração

    if (!req.file) {
        console.log('No file uploaded'); // Log para depuração
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File uploaded:', req.file); // Log para depuração

    const pdfPath = req.file.filename;
    const sql = `
        UPDATE Custo
        SET pdf_path = ?
        WHERE id = ?
    `;

    db.query(sql, [pdfPath, custoId], (err) => {
        if (err) {
            console.error('Error updating cost with PDF path:', err);
            res.status(500).json({ error: 'Error updating cost with PDF path' });
            return;
        }
        res.status(200).json({ message: 'PDF uploaded successfully' });
    });
});

// Endpoint para fazer o upload do PDF na tabela Custo Variável
app.post('/api/custo-variavel/:id/upload-pdf', uploadCustoVariavel, (req, res) => {
    const custoVariavelId = req.params.id;

    console.log('Received request to upload PDF for custo variável ID:', custoVariavelId); // Log para depuração

    if (!req.file) {
        console.log('No file uploaded'); // Log para depuração
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File uploaded:', req.file); // Log para depuração

    const pdfPath = req.file.filename;
    const sql = `
        UPDATE CustoVariavel
        SET pdf_path = ?
        WHERE id = ?
    `;

    db.query(sql, [pdfPath, custoVariavelId], (err) => {
        if (err) {
            console.error('Error updating cost variable with PDF path:', err);
            res.status(500).json({ error: 'Error updating cost variable with PDF path' });
            return;
        }
        res.status(200).json({ message: 'PDF uploaded successfully' });
    });
});

// Endpoint para forçar o download do PDF da tabela custo
app.get('/api/custo-variavel/:id/download-pdf', (req, res) => {
    const custoId = req.params.id;
    const filePath = path.join(__dirname, 'uploads', `${custoId}.pdf`);

    if (fs.existsSync(filePath)) {
        res.download(filePath, `${custoId}.pdf`, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ error: 'Error downloading file' });
            }
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Endpoint para adicionar um custo variável
app.post('/api/custo-variavel', (req, res) => {
    const { data, descricao, valor, tipo_pagamento, situacao, data_pagamento } = req.body;

    if (!data || !descricao || !valor || !tipo_pagamento || !situacao) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = `
        INSERT INTO CustoVariavel (data, descricao, valor, tipo_pagamento_id, situacao_id, data_pagamento)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [data, descricao, valor, tipo_pagamento, situacao, data_pagamento], (err) => {
        if (err) {
            console.error('Error inserting variable cost:', err);
            return res.status(500).json({ error: 'Error inserting variable cost' });
        }
        res.status(201).json({ message: 'Variable cost added successfully' });
    });
});

// Endpoint para recuperar todos os custos variáveis
app.get('/api/custo-variavel', (req, res) => {
    const sql = `SELECT CustoVariavel.*, tipo.descricao AS tipo_pagamento_descricao, situacao.descricao AS situacao_descricao
                 FROM CustoVariavel
                 LEFT JOIN TipoPagamento tipo ON CustoVariavel.tipo_pagamento_id = tipo.id
                 LEFT JOIN Situacao situacao ON CustoVariavel.situacao_id = situacao.id`;
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Erro ao recuperar dados:', error);
            return res.status(500).json({ error: 'Erro ao recuperar dados.' });
        }
        res.json(results);
    });
});

// Endpoint para obter os dados da tabela CustoSecundario
app.get('/api/custo-secundario', (req, res) => {
    const sql = 'SELECT * FROM CustoSecundario';

    db.query(sql, (error, results) => {
        if (error) {
            console.error('Erro ao obter dados da tabela CustoSecundario:', error);
            return res.status(500).json({ error: 'Erro ao obter dados.' });
        }
        res.json(results);
    });
});

// Endpoint para pesquisar por custo secundario pela data
app.get('/api/custo-secundario', (req, res) => {
    const month = req.query.month; // Mês no formato YYYY-MM
    const year = req.query.year; // Ano no formato YYYY

    if (!month || !year) {
        return res.status(400).json({ error: 'Ano ou mês não fornecido.' });
    }

    console.log("Ano e mês selecionados no servidor:", year, month);

    // Extrair o primeiro dia do mês e o último dia do mês
    const startDate = new Date(`${year}-${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Incrementa para o próximo mês
    endDate.setDate(0); // Definir para o último dia do mês anterior

    // Formatar as datas para MySQL no formato YYYY-MM-DD
    const startDateFormatted = startDate.toISOString().slice(0, 10);
    const endDateFormatted = endDate.toISOString().slice(0, 10);

    console.log("Data inicial:", startDateFormatted, "Data final:", endDateFormatted);

    // Modificar a query SQL para usar o intervalo de datas
    const sql = `
        SELECT * FROM CustoSecundario
        WHERE DATE(data) BETWEEN ? AND ?
    `;

    db.query(sql, [startDateFormatted, endDateFormatted], (error, results) => {
        if (error) {
            console.error('Erro ao buscar custos secundários:', error);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }

        console.log("Resultados filtrados:", results);
        res.json(results);
    });
});

app.post('/merge-pdfs', upload.array('pdfs', 2), async (req, res) => {
    const [pdf1Path, pdf2Path] = req.files.map(file => file.path);
    
    const pdfDoc = await PDFDocument.create();
    
    const pdf1Bytes = fs.readFileSync(pdf1Path);
    const pdf2Bytes = fs.readFileSync(pdf2Path);
    
    const [pdf1Doc, pdf2Doc] = await Promise.all([
        PDFDocument.load(pdf1Bytes),
        PDFDocument.load(pdf2Bytes),
    ]);
    
    const [pdf1Pages, pdf2Pages] = await Promise.all([
        pdf1Doc.copyPages(pdf1Doc, pdf1Doc.getPageIndices()),
        pdf2Doc.copyPages(pdf2Doc, pdf2Doc.getPageIndices()),
    ]);
    
    pdfPages.forEach(page => pdfDoc.addPage(page));
    
    const pdfBytes = await pdfDoc.save();
    
    fs.writeFileSync('combined.pdf', pdfBytes);
    
    res.download('combined.pdf', 'combined.pdf', (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao gerar PDF combinado.');
        }
        
        // Limpar arquivos temporários
        fs.unlinkSync(pdf1Path);
        fs.unlinkSync(pdf2Path);
        fs.unlinkSync('combined.pdf');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
