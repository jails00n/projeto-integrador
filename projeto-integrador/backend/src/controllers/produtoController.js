const db = require('../db');

function validar(body) {
  const erros = [];
  const nome = String(body.nome ?? '').trim();
  const preco = Number(body.preco);
  if (!nome) erros.push('O nome é obrigatório.');
  if (body.preco === undefined || body.preco === '' || Number.isNaN(preco) || preco < 0) {
    erros.push('O preço deve ser um número maior ou igual a zero.');
  }
  return {
    erros,
    dados: {
      nome,
      descricao: String(body.descricao ?? '').trim(),
      preco,
      codigo_barras: String(body.codigo_barras ?? '').trim() || null,
    },
  };
}

function tratarErroBanco(err, res) {
  if (String(err.code).startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({ erro: 'Já existe um produto com este código de barras.' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

exports.listar = (req, res) => {
  res.json(db.prepare('SELECT * FROM produtos ORDER BY nome').all());
};

exports.buscar = (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(produto);
};

exports.criar = (req, res) => {
  const { erros, dados } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  try {
    const info = db
      .prepare('INSERT INTO produtos (nome, descricao, preco, codigo_barras) VALUES (@nome, @descricao, @preco, @codigo_barras)')
      .run(dados);
    res.status(201).json(db.prepare('SELECT * FROM produtos WHERE id = ?').get(info.lastInsertRowid));
  } catch (err) {
    tratarErroBanco(err, res);
  }
};

exports.atualizar = (req, res) => {
  const { erros, dados } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  try {
    const info = db
      .prepare('UPDATE produtos SET nome=@nome, descricao=@descricao, preco=@preco, codigo_barras=@codigo_barras WHERE id=@id')
      .run({ ...dados, id: req.params.id });
    if (!info.changes) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id));
  } catch (err) {
    tratarErroBanco(err, res);
  }
};

exports.remover = (req, res) => {
  const info = db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.status(204).end();
};
