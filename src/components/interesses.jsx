import React, { useState, useEffect } from 'react';
import CarCard from './carCard';

function Interesses({ todosOsCarrosGeral, termoBuscaAtual }) {
  const itensPorPagina = 12;
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carrosInteressados, setCarrosInteressados] = useState([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState([]);
  const [mensagemFeedback, setMensagemFeedback] = useState('Carregando seus veículos de interesse...');
  const [isLoading, setIsLoading] = useState(true);
  
  document.title = "Meus Veículos de Interesse";

  const fetchInteresses = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('userToken');
    if (!token) {
        setMensagemFeedback('Você precisa estar logado para ver seus interesses.');
        setIsLoading(false);
        setCarrosInteressados([]);
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/interesses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
              setMensagemFeedback('Sua sessão expirou. Por favor, faça o login novamente.');
              setCarrosInteressados([]);
              setIsLoading(false);
              return;
            }
            throw new Error('Não foi possível carregar os interesses.');
        }

        const idsInteresse = await response.json();
        
        if (todosOsCarrosGeral && todosOsCarrosGeral.length > 0) {
            const carrosComInteresse = todosOsCarrosGeral.filter(carro => idsInteresse.includes(carro.id));
            setCarrosInteressados(carrosComInteresse);
        }

    } catch (error) {
        setMensagemFeedback(error.message);
        setCarrosInteressados([]);
    } finally {
        setIsLoading(false);
    }
  };
  useEffect(() => {
    if (todosOsCarrosGeral.length > 0) {
        fetchInteresses();
    }
  }, [todosOsCarrosGeral]);

  useEffect(() => {
    let filtrados = carrosInteressados;
    if (termoBuscaAtual && termoBuscaAtual.trim() !== '') {
        const termo = termoBuscaAtual.toLowerCase();
        filtrados = carrosInteressados.filter(carro =>
            carro.nome.toLowerCase().includes(termo) ||
            carro.marca.toLowerCase().includes(termo)
        );
    }
    setCarrosFiltrados(filtrados);

    if (!isLoading) {
        if (carrosInteressados.length === 0) {
            if (localStorage.getItem('userToken')) {
                setMensagemFeedback("Você ainda não marcou nenhum veículo como interesse.");
            }
        } else if (filtrados.length === 0) {
            setMensagemFeedback(`Nenhum veículo de interesse encontrado para "${termoBuscaAtual}".`);
        } else {
            setMensagemFeedback('');
        }
    }
  }, [termoBuscaAtual, carrosInteressados, isLoading]);
  
  const handleRemoverInteresse = async (carroId) => {
    const token = localStorage.getItem('userToken');
    if(!token) return;

    try {
        const response = await fetch(`http://localhost:3001/api/interesses/${carroId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) { throw new Error('Falha ao remover interesse.'); }
        
        setCarrosInteressados(prev => prev.filter(carro => carro.id !== carroId));

    } catch (error) {
        console.error(error.message);
    }
  };


  const indiceUltimoCarro = paginaAtual * itensPorPagina;
  const indicePrimeiroCarro = indiceUltimoCarro - itensPorPagina;
  const carrosDaPaginaAtual = carrosFiltrados.slice(indicePrimeiroCarro, indiceUltimoCarro);
  const totalPaginas = Math.ceil(carrosFiltrados.length / itensPorPagina);

  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const renderizarBotoesPaginacao = () => {
    if (totalPaginas <= 1) return null;
    const botoes = [];
    if (paginaAtual > 1) { botoes.push(<button key="anterior" onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>); }
    for (let i = 1; i <= totalPaginas; i++) { botoes.push(<button key={i} onClick={() => mudarPagina(i)} disabled={i === paginaAtual}>{i}</button>);}
    if (paginaAtual < totalPaginas) { botoes.push(<button key="proxima" onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>); }
    return botoes;
  };


  return (
    <div>
      <h2>Meus Veículos de Interesse</h2>
      <div id="vitrine-interesses"> 
        {isLoading ? (
            <p className="mensagem-feedback-interesses" style={{ display: 'block', width: '100%' }}>{mensagemFeedback}</p>
        ) : carrosDaPaginaAtual.length > 0 ? (
          carrosDaPaginaAtual.map(carro => (
            <div key={carro.id} className="carro-item-interesse">
              <CarCard carro={carro} />
              <button 
                className="btn-remover-interesse-lista"
                onClick={() => handleRemoverInteresse(carro.id)}
              >
                Remover Interesse
              </button>
            </div>
          ))
        ) : (
          <p className="mensagem-feedback-interesses" style={{ display: 'block', width: '100%' }}>
            {mensagemFeedback}
          </p>
        )}
      </div>
      <div id="paginacao-interesses">
        {!isLoading && carrosFiltrados.length > 0 && renderizarBotoesPaginacao()}
      </div>
    </div>
  );
}

export default Interesses;