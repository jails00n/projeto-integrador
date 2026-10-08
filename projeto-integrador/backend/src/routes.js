const express = require('express');
const produtos = require('./controllers/produtoController');
const fornecedores = require('./controllers/fornecedorController');
const assoc = require('./controllers/associacaoController');

const router = express.Router();

// Produtos
router.get('/produtos', produtos.listar);
router.post('/produtos', produtos.criar);
router.get('/produtos/:id', produtos.buscar);
router.put('/produtos/:id', produtos.atualizar);
router.delete('/produtos/:id', produtos.remover);
router.get('/produtos/:id/fornecedores', assoc.fornecedoresDoProduto);

// Fornecedores
router.get('/fornecedores', fornecedores.listar);
router.post('/fornecedores', fornecedores.criar);
router.get('/fornecedores/:id', fornecedores.buscar);
router.put('/fornecedores/:id', fornecedores.atualizar);
router.delete('/fornecedores/:id', fornecedores.remover);
router.get('/fornecedores/:id/produtos', assoc.produtosDoFornecedor);

// Associação produto/fornecedor
router.get('/associacoes', assoc.listar);
router.post('/associacoes', assoc.associar);
router.delete('/associacoes/:produtoId/:fornecedorId', assoc.desassociar);

module.exports = router;
