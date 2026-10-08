const db = require('../db');

function cnpjValido(valor) {
  const c = String(valor).replace(/\D/g, '');
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (base) => {
    let soma = 0;
    let peso = base.length - 7;
    for (const d of base) {
      soma += Number(d) * peso--;
      if (peso < 2) peso = 9;
    }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c.slice(0, 12));
  const d2 = calc(c.slice(0, 12) + d1);
  return c.endsWith(`${d1}${d2}`);
}

function validar(body) {
  const erros = [];
  const nome = String(body.nome ?? '').trim();
  const cnpj = String(body.cnpj ?? '').replace(/\D/g, '');
  if (!nome) erros.push('O nome é obrigatório.');
  if (!cnpjValido(cnpj)) erros.push('CNPJ inválido.');
  return {
    erros,
    dados: {
      nome,
      cnpj,
      endereco: String(body.endereco ?? '').trim(),
      contato: String(body.contato ?? '').trim(),
    },
  };
}

function tratarErroBanco(err, res) {
  if (String(err.code).startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({ erro: 'Já existe um fornecedor com este CNPJ.' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

exports.listar = (req, res) => {
  res.json(db.prepare('SELECT * FROM fornecedores ORDER BY nome').all());
};

exports.buscar = (req, res) => {
  const f = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  res.json(f);
};

exports.criar = (req, res) => {
  const { erros, dados } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  try {
    const info = db
      .prepare('INSERT INTO fornecedores (nome, cnpj, endereco, contato) VALUES (@nome, @cnpj, @endereco, @contato)')
      .run(dados);
    res.status(201).json(db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(info.lastInsertRowid));
  } catch (err) {
    tratarErroBanco(err, res);
  }
};

exports.atualizar = (req, res) => {
  const { erros, dados } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  try {
    const info = db
      .prepare('UPDATE fornecedores SET nome=@nome, cnpj=@cnpj, endereco=@endereco, contato=@contato WHERE id=@id')
      .run({ ...dados, id: req.params.id });
    if (!info.changes) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
    res.json(db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id));
  } catch (err) {
    tratarErroBanco(err, res);
  }
};

exports.remover = (req, res) => {
  const info = db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  res.status(204).end();
};
