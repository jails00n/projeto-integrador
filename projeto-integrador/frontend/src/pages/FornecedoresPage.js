import { useCallback, useEffect, useState } from 'react';
import { api, formatarCnpj } from '../api';

const VAZIO = { nome: '', cnpj: '', endereco: '', contato: '' };

export default function FornecedoresPage() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setItens(await api.fornecedores.listar());
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
        await api.fornecedores.atualizar(editandoId, form);
        setMsg({ tipo: 'ok', texto: 'Fornecedor atualizado.' });
      } else {
        await api.fornecedores.criar(form);
        setMsg({ tipo: 'ok', texto: 'Fornecedor cadastrado.' });
      }
      cancelar();
      carregar();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  const editar = (f) => {
    setEditandoId(f.id);
    setForm({ nome: f.nome, cnpj: formatarCnpj(f.cnpj), endereco: f.endereco || '', contato: f.contato || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remover = async (f) => {
    if (!window.confirm(`Excluir o fornecedor "${f.nome}"? As associações com produtos também serão removidas.`)) return;
    try {
      await api.fornecedores.remover(f.id);
      setMsg({ tipo: 'ok', texto: 'Fornecedor excluído.' });
      if (editandoId === f.id) cancelar();
      carregar();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
    }
  };

  return (
    <>
      <h1>Fornecedores</h1>
      {msg && <p className={`aviso ${msg.tipo}`} role="status">{msg.texto}</p>}

      <form className="formulario" onSubmit={salvar}>
        <h2>{editandoId ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>
        <div className="grade">
          <label>
            Nome
            <input name="nome" value={form.nome} onChange={mudar} required />
          </label>
          <label>
            CNPJ
            <input name="cnpj" value={form.cnpj} onChange={mudar} placeholder="00.000.000/0000-00" required />
          </label>
          <label className="larga">
            Endereço
            <input name="endereco" value={form.endereco} onChange={mudar} />
          </label>
          <label className="larga">
            Contato (telefone ou e-mail)
            <input name="contato" value={form.contato} onChange={mudar} />
          </label>
        </div>
        <div className="acoes">
          <button type="submit" className="primario">{editandoId ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
          {editandoId && <button type="button" onClick={cancelar}>Cancelar edição</button>}
        </div>
      </form>

      <div className="tabela-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>CNPJ</th><th>Endereço</th><th>Contato</th><th></th></tr>
          </thead>
          <tbody>
            {carregando && <tr><td colSpan="5">Carregando…</td></tr>}
            {!carregando && itens.length === 0 && (
              <tr><td colSpan="5" className="vazio">Nenhum fornecedor cadastrado. Use o formulário acima para adicionar o primeiro.</td></tr>
            )}
            {itens.map((f) => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{formatarCnpj(f.cnpj)}</td>
                <td>{f.endereco}</td>
                <td>{f.contato}</td>
                <td className="linha-acoes">
                  <button onClick={() => editar(f)}>Editar</button>
                  <button className="perigo" onClick={() => remover(f)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
