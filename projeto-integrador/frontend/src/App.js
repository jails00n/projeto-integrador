import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import ProdutosPage from './pages/ProdutosPage';
import FornecedoresPage from './pages/FornecedoresPage';
import AssociacoesPage from './pages/AssociacoesPage';

export default function App() {
  return (
    <>
      <header className="topo">
        <div className="topo-conteudo">
          <strong className="marca">Catálogo de suprimentos</strong>
          <nav>
            <NavLink to="/produtos">Produtos</NavLink>
            <NavLink to="/fornecedores">Fornecedores</NavLink>
            <NavLink to="/associacoes">Associações</NavLink>
          </nav>
        </div>
      </header>
      <main className="pagina">
        <Routes>
          <Route path="/" element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/fornecedores" element={<FornecedoresPage />} />
          <Route path="/associacoes" element={<AssociacoesPage />} />
          <Route path="*" element={<p>Página não encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
