# Sistema de Gestão de Custos Secundários

Este projeto é uma aplicação web simples para a gestão de custos secundários, permitindo ao utilizador:

- Visualizar todos os custos registados.
- Filtrar custos por mês.
- Fazer o upload e visualização de documentos PDF relacionados com os custos.

## Funcionalidades

1. **Visualização de Custos**:
   - Lista de custos secundários com detalhes como descrição, valor, data de pagamento, e um link para visualização de documentos PDF.

2. **Pesquisa por Mês**:
   - Permite ao utilizador pesquisar custos secundários de um mês específico usando uma data no formato `YYYY-MM`.

3. **Upload de PDFs**:
   - Associar documentos PDF a cada custo secundário.

## Tecnologias Utilizadas

- **Frontend**:
  - HTML, CSS, JavaScript
  - Fetch API para comunicações com o backend.

- **Backend**:
  - Node.js com Express.js
  - MySQL para armazenamento de dados.

## Instalação e Configuração

### Pré-requisitos

1. Node.js (v16 ou superior)
2. MySQL (v8 ou superior)

### Passos de Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd nome-do-repositorio

2. Instale as dependências do projeto:
    ```bash
    npm install

3. Configure a base de dados:
    Crie uma base de dados no MySQL.
    Importe o ficheiro schema.sql (localizado na pasta db/) para configurar as tabelas.
    SOURCE Cost-Management-System/bd/schema.sql;

4. Configure as variáveis de ambiente: Crie um ficheiro .env na raiz do projeto e adicione:
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=nome_da_base_de_dados

5. Inicie o servidor:
    node server.js

6. Abra o navegador e aceda:
    http://localhost:3000

## Contactos

**Nome:** Rodrigo Pita     
**Email:** rodrigomcpita@gmail.com