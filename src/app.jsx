import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Importar os componentes reais
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import HomePage from './components/homePage.jsx';
import Interesses from './components/interesses.jsx';
import DetailPage from './components/detailPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';

// Componente App principal
function App() {
  console.log("App component está sendo renderizado");
  
  const [todosOsCarros, setTodosOsCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    console.log('Efeito executado - tentando carregar dados...');
    const controller = new AbortController();
    
    const fetchCarros = async () => { 
      setLoading(true);
      setError(null);
      try {
        // =============== MUDANÇA AQUI: CARREGANDO DO CAMINHO PUBLIC/DADOS LOCAL ===============
        const carrosJsonUrl = '/dados/carros.json'; 
        console.log('Tentando carregar JSON de:', carrosJsonUrl);
        
        const response = await fetch(carrosJsonUrl, { 
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}. Verifique se public/dados/carros.json existe.`);
        }
        
        const data = await response.json();
        console.log('Dados carregados com sucesso:', data.length, 'itens');
        setTodosOsCarros(data);
      } catch (err) { 
        if (err.name !== 'AbortError') {
          console.error('Erro ao carregar dados dos carros:', err);
          setError(err.message);
          setTodosOsCarros([]); // Limpar carros se houver erro grave.
        }
      } finally { 
        setLoading(false);
        console.log('Carregamento de dados finalizado');
      }
    };
    
    fetchCarros();
    return () => controller.abort();
  }, []);

  const handleBuscaChange = (termo) => {
    setTermoBusca(termo);
  };

  const irParaHome = () => navigate('/');
  const irParaInteresses = () => navigate('/interesses');

  let pageContent;
  if (loading) {
    pageContent = <p className="mensagem-feedback">Carregando veículos...</p>;
  } else if (error) {
    pageContent = (
      <div className="mensagem-feedback" style={{ color: 'red' }}>
        <h3>Erro ao carregar dados iniciais dos veículos</h3>
        <p>{error}</p>
        <p>Certifique-se de que "carros.json" está em "public/dados/carros.json" na pasta raiz do frontend.</p>
      </div>
    );
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
      />
      <main> 
        {pageContent}
      </main>
      <Footer />
    </>
  );
}

export default App;