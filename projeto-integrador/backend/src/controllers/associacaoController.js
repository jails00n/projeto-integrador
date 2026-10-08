const db = require('../db');

// Lista todas as associações (com nomes, para facilitar a exibição)
exports.listar = (req, res) => {
  const linhas = db
    .prepare(`
      SELECT pf.produto_id, p.nome AS produto_nome,
             pf.fornecedor_id, f.nome AS fornecedor_nome
      FROM produto_fornecedor pf
      JOIN produtos p ON p.id = pf.produto_id
      JOIN fornecedores f ON f.id = pf.fornecedor_id
      ORDER BY p.nome, f.nome
    `)
    .all();
  res.json(linhas);
};

// Associa um produto a um fornecedor
exports.associar = (req, res) => {
  const produtoId = Number(req.body.produto_id);
  const fornecedorId = Number(req.body.fornecedor_id);
  if (!Number.isInteger(produtoId) || !Number.isInteger(fornecedorId)) {
    return res.status(400).json({ erro: 'Informe produto_id e fornecedor_id.' });
  }
  if (!db.prepare('SELECT 1 FROM produtos WHERE id = ?').get(produtoId)) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }
  if (!db.prepare('SELECT 1 FROM fornecedores WHERE id = ?').get(fornecedorId)) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  }
  try {
    db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)').run(produtoId, fornecedorId);
    res.status(201).json({ produto_id: produtoId, fornecedor_id: fornecedorId });
  } catch (err) {
    if (String(err.code).startsWith('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ erro: 'Este produto já está associado a este fornecedor.' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// Desassocia
exports.desassociar = (req, res) => {
  const info = db
    .prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
    .run(req.params.produtoId, req.params.fornecedorId);
  if (!info.changes) return res.status(404).json({ erro: 'Associação não encontrada.' });
  res.status(204).end();
};

// Produtos fornecidos por um fornecedor
exports.produtosDoFornecedor = (req, res) => {
  if (!db.prepare('SELECT 1 FROM fornecedores WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  }
  res.json(
    db
      .prepare(`
        SELECT p.* FROM produtos p
        JOIN produto_fornecedor pf ON pf.produto_id = p.id
        WHERE pf.fornecedor_id = ? ORDER BY p.nome
      `)
      .all(req.params.id)
  );
};

// Fornecedores de um produto
exports.fornecedoresDoProduto = (req, res) => {
  if (!db.prepare('SELECT 1 FROM produtos WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }
  res.json(
    db
      .prepare(`
        SELECT f.* FROM fornecedores f
        JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
        WHERE pf.produto_id = ? ORDER BY f.nome
      `)
      .all(req.params.id)
  );
};
