
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import HomePage from './components/homePage';
import Interesses from './components/interesses';
import DetailPage from './components/detailPage';
import LoginPage from './components/LoginPage'; 
import RegisterPage from './components/RegisterPage';

function App() {
  const [todosOsCarros, setTodosOsCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarros = async () => { 
        setLoading(true);
        setError(null);
        try {
            const carrosJsonUrl = `${import.meta.env.BASE_URL}dados/carros.json`;
            const response = await fetch(carrosJsonUrl);
            if (!response.ok) { throw new Error(`HTTP ${response.status} ao buscar ${carrosJsonUrl}`); }
            const data = await response.json();
            setTodosOsCarros(data);
        } catch (err) { setError(err.message); setTodosOsCarros([]);
        } finally { setLoading(false); }
    };
    fetchCarros();
  }, []);

  const handleBuscaChange = (termo) => {
    setTermoBusca(termo);
  };

  const irParaHome = () => navigate('/');
  const irParaInteresses = () => navigate('/interesses');
  const irParaLogin = () => navigate('/login');
  const irParaRegister = () => navigate('/register');

  let pageContent;
  if (loading) {
    pageContent = <p style={{ textAlign: 'center', padding: '50px', fontStyle: 'italic', color: '#6c757d' }}>Carregando veículos...</p>;
  } else if (error) {
    pageContent = <p style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Erro ao carregar dados: {error}</p>;
  } else {
    pageContent = (
      <Routes>
        <Route 
          path="/" 
          element={<HomePage todosOsCarrosOriginal={todosOsCarros} termoBuscaAtual={termoBusca} />} 
        />
        <Route 
          path="/interesses" 
          element={<Interesses todosOsCarrosGeral={todosOsCarros} termoBuscaAtual={termoBusca} />} 
        />
        <Route 
          path="/carro/:carroId" 
          element={<DetailPage todosOsCarros={todosOsCarros} />} 
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="*" 
          element={<HomePage todosOsCarrosOriginal={todosOsCarros} termoBuscaAtual={termoBusca} />} 
        />
      </Routes>
    );
  }

  return (
    <>
      <Header 
        termoBusca={termoBusca} 
        onBuscaChange={handleBuscaChange}
        onNavigateHome={irParaHome}         
        onNavigateInteresses={irParaInteresses}
        onNavigateLogin={irParaLogin}
        onNavigateRegister={irParaRegister}
      />
      <main> 
        {pageContent}
      </main>
      <Footer />
    </>
  );
}

export default App;