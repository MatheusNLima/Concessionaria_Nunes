import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../detalhe.css';

function DetailPage({ todosOsCarros }) {
  const { carroId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, interestIds, toggleInterest } = useAuth();
  
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  
  const placeholderSrcGlobal = `${import.meta.env.BASE_URL}placeholder_img/placeholder-400x300_fallback.png`;
  const isFavorited = carroSelecionado ? interestIds.includes(carroSelecionado.id) : false;
  
  useEffect(() => {
    if (todosOsCarros.length > 0) {
      const idNumerico = parseInt(carroId, 10);
      const encontrado = todosOsCarros.find(c => c.id === idNumerico);
      setCarroSelecionado(encontrado);
      
      const fotoInicial = encontrado?.fotosUrls?.[0] ? `${import.meta.env.BASE_URL}${encontrado.fotosUrls[0]}` : placeholderSrcGlobal;
      setImagemPrincipal(fotoInicial);
      document.title = encontrado ? `${encontrado.nome} - Detalhes` : 'Veículo não encontrado';
    }
  }, [carroId, todosOsCarros]);

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
        alert("Você precisa estar logado para favoritar um veículo.");
        navigate('/login');
        return;
    }
    toggleInterest(carroSelecionado.id);
  };
  
  if (!carroSelecionado) {
    return (
        <div id="detalhe-carro-container" style={{ textAlign: 'center', padding: '50px' }}>
            <p>Carro com ID {carroId} não encontrado.</p>
            <Link to="/">« Voltar para a Vitrine</Link>
        </div>
    );
  }

  return (
    <div id="detalhe-carro-container">
      <div className="detalhe-carro-grid">
        <div className="detalhe-imagens">
          <img
            id="imagem-principal-detalhe"
            src={imagemPrincipal || placeholderSrcGlobal}
            alt={`Foto principal de ${carroSelecionado.nome}`}
            onError={(e) => { e.target.src = placeholderSrcGlobal;}} 
          />
          {carroSelecionado.fotosUrls && carroSelecionado.fotosUrls.length > 1 && (
            <div className="miniaturas">
              {carroSelecionado.fotosUrls.map((fotoUrlRelativa, index) => {
                const fotoUrlCompleta = `${import.meta.env.BASE_URL}${fotoUrlRelativa}`;
                return (
                  <img
                    key={index}
                    src={fotoUrlCompleta}
                    alt={`Miniatura ${index + 1}`}
                    onClick={() => setImagemPrincipal(fotoUrlCompleta)}
                    className={fotoUrlCompleta === imagemPrincipal ? 'ativa' : ''}
                    onError={(e) => { e.target.style.display='none';}}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className="detalhe-info">
          <div className="detalhe-header">
              <h2>{carroSelecionado.nome}</h2>
              <button className="btn-favorite-detail" onClick={handleFavoriteClick} aria-label={isFavorited ? "Desfavoritar" : "Favoritar"}>
                  <svg viewBox="0 0 24 24" width="32" height="32" strokeWidth="1.5">
                      {isFavorited ? (
                          <path className="heart-filled" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      ) : (
                          <path className="heart-outline" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                      )}
                  </svg>
              </button>
          </div>
          <p className="marca-ano">{carroSelecionado.marca} - {carroSelecionado.ano}</p>
          <p className="preco-detalhe">{carroSelecionado.preco}</p>
          <p className="descricao-completa">
            {carroSelecionado.descricao.split('\n').map((str, i) => <React.Fragment key={i}>{str}<br/></React.Fragment>)}
          </p>
        </div>
      </div>
      <div className="botoes-navegacao-detalhe" style={{marginTop: '40px', textAlign: 'center'}}>
        <Link to="/" className="btn-voltar-pagina" style={{padding: '10px 25px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '6px'}}>
            « Voltar para Vitrine
        </Link>
        <Link to="/interesses" className="btn-ver-interesses" style={{marginLeft: '20px', padding: '10px 25px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '6px'}}>
            Ver Meus Favoritos
        </Link>
      </div>
    </div>
  );
}

export default DetailPage;