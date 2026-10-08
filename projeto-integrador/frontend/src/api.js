const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  let resp;
  try {
    resp = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.');
  }
  if (resp.status === 204) return null;
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.erro || 'Erro inesperado.');
  return data;
}

const body = (obj) => JSON.stringify(obj);

export const api = {
  produtos: {
    listar: () => request('/produtos'),
    criar: (d) => request('/produtos', { method: 'POST', body: body(d) }),
    atualizar: (id, d) => request(`/produtos/${id}`, { method: 'PUT', body: body(d) }),
    remover: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
    fornecedores: (id) => request(`/produtos/${id}/fornecedores`),
  },
  fornecedores: {
    listar: () => request('/fornecedores'),
    criar: (d) => request('/fornecedores', { method: 'POST', body: body(d) }),
    atualizar: (id, d) => request(`/fornecedores/${id}`, { method: 'PUT', body: body(d) }),
    remover: (id) => request(`/fornecedores/${id}`, { method: 'DELETE' }),
    produtos: (id) => request(`/fornecedores/${id}/produtos`),
  },
  associacoes: {
    listar: () => request('/associacoes'),
    associar: (produto_id, fornecedor_id) =>
      request('/associacoes', { method: 'POST', body: body({ produto_id, fornecedor_id }) }),
    desassociar: (produtoId, fornecedorId) =>
      request(`/associacoes/${produtoId}/${fornecedorId}`, { method: 'DELETE' }),
  },
};

export const formatarPreco = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarCnpj = (c) =>
  String(c).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
