import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarCard from './carCard';

function Interesses({ todosOsCarrosGeral, termoBuscaAtual }) {
  const navigate = useNavigate();
  const itensPorPagina = 12;
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carrosInteressadosBase, setCarrosInteressadosBase] = useState([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState([]);
  const [mensagemFeedback, setMensagemFeedback] = useState('Carregando seus veículos de interesse...');
  document.title = "Meus Veículos de Interesse";

  useEffect(() => {
    if (todosOsCarrosGeral && todosOsCarrosGeral.length >= 0) {
      const idsInteresse = JSON.parse(localStorage.getItem('carrosInteresse')) || [];
      const base = todosOsCarrosGeral.filter(carro => idsInteresse.includes(carro.id));
      setCarrosInteressadosBase(base);
    }
  }, [todosOsCarrosGeral]);

  useEffect(() => {
    let filtradosParaExibir = carrosInteressadosBase;
    if (termoBuscaAtual && termoBuscaAtual.trim() !== '') {
      const termo = termoBuscaAtual.toLowerCase();
      filtradosParaExibir = carrosInteressadosBase.filter(carro =>
        carro.nome.toLowerCase().includes(termo) ||
        carro.marca.toLowerCase().includes(termo)
      );
    }
    setCarrosFiltrados(filtradosParaExibir);

    const totalPaginasFiltradas = Math.ceil(filtradosParaExibir.length / itensPorPagina);
    if (paginaAtual > totalPaginasFiltradas && totalPaginasFiltradas > 0) {
        setPaginaAtual(totalPaginasFiltradas);
    } else if (totalPaginasFiltradas === 0 && paginaAtual > 1) {
        setPaginaAtual(1);
    }

    if (carrosInteressadosBase.length === 0 && !(todosOsCarrosGeral && todosOsCarrosGeral.length > 0)) {
    } else if (carrosInteressadosBase.length === 0) {
        setMensagemFeedback("Você ainda não marcou nenhum veículo como interesse.");
    } else if (filtradosParaExibir.length === 0 && termoBuscaAtual && termoBuscaAtual.trim() !== '') {
        setMensagemFeedback(`Nenhum veículo de interesse encontrado para "${termoBuscaAtual}".`);
    } else {
        setMensagemFeedback('');
    }
  }, [termoBuscaAtual, carrosInteressadosBase, paginaAtual, todosOsCarrosGeral, itensPorPagina]);

  const indiceUltimoCarro = paginaAtual * itensPorPagina;
  const indicePrimeiroCarro = indiceUltimoCarro - itensPorPagina;
  const carrosDaPaginaAtual = carrosFiltrados.slice(indicePrimeiroCarro, indiceUltimoCarro);

  const totalPaginas = Math.ceil(carrosFiltrados.length / itensPorPagina);

  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoverInteresse = (carroId) => {
    let idsAtuais = JSON.parse(localStorage.getItem('carrosInteresse')) || [];
    idsAtuais = idsAtuais.filter(id => id !== carroId);
    localStorage.setItem('carrosInteresse', JSON.stringify(idsAtuais));
    const novaBaseInteressados = todosOsCarrosGeral.filter(carro => idsAtuais.includes(carro.id));
    setCarrosInteressadosBase(novaBaseInteressados);
  };

  const renderizarBotoesPaginacao = () => {
    if (totalPaginas <= 1) return null;
    const botoes = [];
    if (paginaAtual > 1) { botoes.push(<button key="anterior" onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>); }
    for (let i = 1; i <= totalPaginas; i++) { botoes.push(<button key={i} onClick={() => mudarPagina(i)} disabled={i === paginaAtual}>{i}</button>);}
    if (paginaAtual < totalPaginas) { botoes.push(<button key="proxima" onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>); }
    return botoes;
  };

  const isLoadingInitialInterests = carrosInteressadosBase.length === 0 && (!mensagemFeedback || mensagemFeedback.includes("Carregando"));

  return (
    <div>
      <h2>Meus Veículos de Interesse</h2>
      <div id="vitrine-interesses"> 
        {isLoadingInitialInterests && todosOsCarrosGeral && todosOsCarrosGeral.length > 0 ? 
            (<p className="mensagem-feedback-interesses" style={{ display: 'block', width: '100%' }}>Você ainda não marcou nenhum veículo como interesse.</p>) 
        : 
        carrosFiltrados.length > 0 && carrosDaPaginaAtual.length > 0 ? (
          carrosDaPaginaAtual.map(carro => (
            <div key={carro.id} className="carro-item-interesse">
              <CarCard carro={carro} />
              <button 
                className="btn-remover-interesse-lista"
                onClick={(e) => { 
                  handleRemoverInteresse(carro.id); 
                }}
              >
                Remover Interesse
              </button>
            </div>
          ))
        ) : (
          <p className="mensagem-feedback-interesses" style={{ display: mensagemFeedback ? 'block' : 'none', width: '100%' }}>
            {mensagemFeedback}
          </p>
        )}
      </div>
      <div id="paginacao-interesses">
        {!isLoadingInitialInterests && carrosFiltrados.length > 0 && renderizarBotoesPaginacao()}
      </div>
    </div>
  );
}

export default Interesses;