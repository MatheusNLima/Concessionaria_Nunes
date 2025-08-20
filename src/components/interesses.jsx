import React, { useState, useEffect } from 'react';
import CarCard from './carCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Interesses({ todosOsCarrosGeral, termoBuscaAtual }) {
  const { interestIds, isLoggedIn } = useAuth();

  const itensPorPagina = 12;
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [carrosInteressados, setCarrosInteressados] = useState([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState([]);
  
  document.title = "Meus Veículos de Interesse";

  useEffect(() => {
    if (todosOsCarrosGeral.length > 0 && interestIds) {
      const carrosComInteresse = todosOsCarrosGeral.filter(carro => interestIds.includes(carro.id));
      setCarrosInteressados(carrosComInteresse);
    } else {
      setCarrosInteressados([]);
    }
  }, [interestIds, todosOsCarrosGeral]);

  useEffect(() => {
    let filtrados = carrosInteressados;
    if (termoBuscaAtual) {
      const termo = termoBuscaAtual.toLowerCase();
      filtrados = carrosInteressados.filter(carro =>
        carro.nome.toLowerCase().includes(termo) ||
        carro.marca.toLowerCase().includes(termo)
      );
    }
    setCarrosFiltrados(filtrados);
    setPaginaAtual(1);
  }, [termoBuscaAtual, carrosInteressados]);
  
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
    let botoes = [];
    if (paginaAtual > 1) { botoes.push(<button key="ant" onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>); }
    for (let i = 1; i <= totalPaginas; i++) { botoes.push(<button key={i} onClick={() => mudarPagina(i)} disabled={i === paginaAtual}>{i}</button>);}
    if (paginaAtual < totalPaginas) { botoes.push(<button key="prox" onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>); }
    return botoes;
  };

  let feedbackMessage = '';
  if (!isLoggedIn) {
    feedbackMessage = 'Você precisa estar logado para ver seus interesses.';
  } else if (carrosInteressados.length === 0) {
    feedbackMessage = "Você ainda não marcou nenhum veículo como interesse.";
  } else if (carrosFiltrados.length === 0 && termoBuscaAtual) {
    feedbackMessage = `Nenhum veículo de interesse encontrado para "${termoBuscaAtual}".`;
  }
  
  return (
    <div>
      <h2>Meus Veículos de Interesse</h2>
      <div id="vitrine-interesses"> 
        {carrosDaPaginaAtual.length > 0 ? (
          carrosDaPaginaAtual.map(carro => (
            <CarCard key={carro.id} carro={carro} />
          ))
        ) : (
          <p className="mensagem-feedback-interesses" style={{ display: 'block', width: '100%' }}>
            {feedbackMessage}
          </p>
        )}
      </div>
      <div id="paginacao-interesses">
        {carrosFiltrados.length > 0 && renderizarBotoesPaginacao()}
      </div>
    </div>
  );
}

export default Interesses;