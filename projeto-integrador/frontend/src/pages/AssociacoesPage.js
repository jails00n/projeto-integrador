import { useCallback, useEffect, useState } from 'react';
import { api, formatarCnpj, formatarPreco } from '../api';

export default function AssociacoesPage() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [msg, setMsg] = useState(null);

  // Consulta
  const [consulta, setConsulta] = useState({ tipo: 'fornecedor', id: '' });
  const [resultado, setResultado] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [p, f, a] = await Promise.all([
        api.produtos.listar(),
        api.fornecedores.listar(),
        api.associacoes.listar(),
      ]);
      setProdutos(p);
      setFornecedores(f);
      setAssociacoes(a);
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e.message });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const associar = async (e) => {
    e.preventDefault();
    try {
      await api.associacoes.associar(Number(produtoId), Number(fornecedorId));
      setMsg({ tipo: 'ok', texto: 'Produto associado ao fornecedor.' });
      setProdutoId('');
      setFornecedorId('');
      carregar();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  const desassociar = async (a) => {
    try {
      await api.associacoes.desassociar(a.produto_id, a.fornecedor_id);
      setMsg({ tipo: 'ok', texto: 'Associação removida.' });
      setResultado(null);
      carregar();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  const consultar = async (e) => {
    e.preventDefault();
    try {
      const itens =
        consulta.tipo === 'fornecedor'
          ? await api.fornecedores.produtos(consulta.id)
          : await api.produtos.fornecedores(consulta.id);
      setResultado({ tipo: consulta.tipo, itens });
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  const opcoesConsulta = consulta.tipo === 'fornecedor' ? fornecedores : produtos;

  return (
    <>
      <h1>Associações entre produtos e fornecedores</h1>
      {msg && <p className={`aviso ${msg.tipo}`} role="status">{msg.texto}</p>}

      <form className="formulario" onSubmit={associar}>
        <h2>Associar produto a fornecedor</h2>
        <div className="grade">
          <label>
            Produto
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
              <option value="">Selecione um produto</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          <label>
            Fornecedor
            <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required>
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </label>
        </div>
        <div className="acoes">
          <button type="submit" className="primario">Associar</button>
        </div>
        {(produtos.length === 0 || fornecedores.length === 0) && (
          <p className="dica">Cadastre ao menos um produto e um fornecedor para criar associações.</p>
        )}
      </form>

      <form className="formulario" onSubmit={consultar}>
        <h2>Consultar</h2>
        <div className="grade">
          <label>
            Buscar
            <select
              value={consulta.tipo}
              onChange={(e) => { setConsulta({ tipo: e.target.value, id: '' }); setResultado(null); }}
            >
              <option value="fornecedor">Produtos de um fornecedor</option>
              <option value="produto">Fornecedores de um produto</option>
            </select>
          </label>
          <label>
            {consulta.tipo === 'fornecedor' ? 'Fornecedor' : 'Produto'}
            <select value={consulta.id} onChange={(e) => setConsulta({ ...consulta, id: e.target.value })} required>
              <option value="">Selecione</option>
              {opcoesConsulta.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </label>
        </div>
        <div className="acoes">
          <button type="submit">Consultar</button>
        </div>
        {resultado && (
          resultado.itens.length === 0 ? (
            <p className="dica">Nenhuma associação encontrada.</p>
          ) : (
            <ul className="resultado">
              {resultado.itens.map((i) => (
                <li key={i.id}>
                  <strong>{i.nome}</strong>
                  <span>
                    {resultado.tipo === 'fornecedor' ? formatarPreco(i.preco) : formatarCnpj(i.cnpj)}
                  </span>
                </li>
              ))}
            </ul>
          )
        )}
      </form>

      <h2>Todas as associações</h2>
      <div className="tabela-wrap">
        <table>
          <thead>
            <tr><th>Produto</th><th>Fornecedor</th><th></th></tr>
          </thead>
          <tbody>
            {associacoes.length === 0 && (
              <tr><td colSpan="3" className="vazio">Nenhuma associação criada ainda.</td></tr>
            )}
            {associacoes.map((a) => (
              <tr key={`${a.produto_id}-${a.fornecedor_id}`}>
                <td>{a.produto_nome}</td>
                <td>{a.fornecedor_nome}</td>
                <td className="linha-acoes">
                  <button className="perigo" onClick={() => desassociar(a)}>Desassociar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
