FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)

Projeto Disciplina Projeto Integrador

# Catálogo de Produtos e Fornecedores

Aplicação fullstack com:

- `backend/`: API REST em Node.js + Express + SQLite (better-sqlite3)
- `frontend/`: React (create-react-app) com 3 páginas: Produtos, Fornecedores e Associações

## Como rodar

Pré-requisito: Node.js LTS.

### 1. Backend (porta 3001)

```bash
cd backend
npm install
npm start
```

### 2. Frontend (porta 3000)

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

Acesse http://localhost:3000. Se mudar a porta/endereço da API, edite `frontend/.env` (`REACT_APP_API_URL`).

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/produtos` | Lista / cria produto |
| GET/PUT/DELETE | `/produtos/:id` | Busca / atualiza / exclui |
| GET | `/produtos/:id/fornecedores` | Fornecedores de um produto |
| GET/POST | `/fornecedores` | Lista / cria fornecedor |
| GET/PUT/DELETE | `/fornecedores/:id` | Busca / atualiza / exclui |
| GET | `/fornecedores/:id/produtos` | Produtos de um fornecedor |
| GET/POST | `/associacoes` | Lista / associa (`{produto_id, fornecedor_id}`) |
| DELETE | `/associacoes/:produtoId/:fornecedorId` | Desassocia |

Produto: `nome`, `descricao`, `preco`, `codigo_barras`.
Fornecedor: `nome`, `cnpj` (validado), `endereco`, `contato`.

## Testando com o Insomnia

Importe `backend/insomnia-collection.json` (Application > Import).

## Enviando ao GitHub

```bash
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```
