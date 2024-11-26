# Sistema de Gestão de Custos Secundários

Este projeto é uma aplicação web para a gestão de custos, permitindo ao utilizador:

- Inserir custos principais e secundários.
- Visualizar todos os custos registados.
- Filtrar informação das tabelas.
- Fazer o upload e visualização de documentos PDF relacionados com os custos.

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
   ```bash
    SOURCE Cost-Management-System/bd/schema.sql;

5. Configure as variáveis de ambiente: Crie um ficheiro .env na raiz do projeto e adicione:
   ```bash
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=nome_da_base_de_dados

7. Inicie o servidor:
   ```bash
    node server.js

9. Abra o navegador e aceda:
    ```bash
    http://localhost:3000

## Contactos

**Nome:** Rodrigo Pita     
**Email:** rodrigomcpita@gmail.com
