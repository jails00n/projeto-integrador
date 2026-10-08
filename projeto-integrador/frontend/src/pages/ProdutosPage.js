import { useCallback, useEffect, useState } from 'react';
import { api, formatarPreco } from '../api';

const VAZIO = { nome: '', descricao: '', preco: '', codigo_barras: '' };

export default function ProdutosPage() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setItens(await api.produtos.listar());
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e.message });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cancelar = () => {
    setForm(VAZIO);
    setEditandoId(null);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.produtos.atualizar(editandoId, form);
        setMsg({ tipo: 'ok', texto: 'Produto atualizado.' });
      } else {
        await api.produtos.criar(form);
        setMsg({ tipo: 'ok', texto: 'Produto cadastrado.' });
      }
      cancelar();
      carregar();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  const editar = (p) => {
    setEditandoId(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao || '',
      preco: p.preco,
      codigo_barras: p.codigo_barras || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remover = async (p) => {
    if (!window.confirm(`Excluir o produto "${p.nome}"? As associações com fornecedores também serão removidas.`)) return;
    try {
      await api.produtos.remover(p.id);
      setMsg({ tipo: 'ok', texto: 'Produto excluído.' });
      if (editandoId === p.id) cancelar();
      carregar();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  return (
    <>
      <h1>Produtos</h1>
      {msg && <p className={`aviso ${msg.tipo}`} role="status">{msg.texto}</p>}

      <form className="formulario" onSubmit={salvar}>
        <h2>{editandoId ? 'Editar produto' : 'Novo produto'}</h2>
        <div className="grade">
          <label>
            Nome
            <input name="nome" value={form.nome} onChange={mudar} required />
          </label>
          <label>
            Preço (R$)
            <input name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={mudar} required />
          </label>
          <label>
            Código de barras
            <input name="codigo_barras" value={form.codigo_barras} onChange={mudar} inputMode="numeric" />
          </label>
          <label className="larga">
            Descrição
            <textarea name="descricao" rows="2" value={form.descricao} onChange={mudar} />
          </label>
        </div>
        <div className="acoes">
          <button type="submit" className="primario">{editandoId ? 'Salvar alterações' : 'Cadastrar produto'}</button>
          {editandoId && <button type="button" onClick={cancelar}>Cancelar edição</button>}
        </div>
      </form>

      <div className="tabela-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>Descrição</th><th className="num">Preço</th><th>Código de barras</th><th></th></tr>
          </thead>
          <tbody>
            {carregando && <tr><td colSpan="5">Carregando…</td></tr>}
            {!carregando && itens.length === 0 && (
              <tr><td colSpan="5" className="vazio">Nenhum produto cadastrado. Use o formulário acima para adicionar o primeiro.</td></tr>
            )}
            {itens.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.descricao}</td>
                <td className="num">{formatarPreco(p.preco)}</td>
                <td>{p.codigo_barras}</td>
                <td className="linha-acoes">
                  <button onClick={() => editar(p)}>Editar</button>
                  <button className="perigo" onClick={() => remover(p)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
