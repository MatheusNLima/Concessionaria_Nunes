import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function CarCard({ carro }) {
  const navigate = useNavigate();
  const { isLoggedIn, interestIds, toggleInterest } = useAuth();
  
  const placeholderSrc = `${import.meta.env.BASE_URL}placeholder_img/placeholder-400x300_fallback.png`;
  const fotoAtual = carro.fotosUrls?.[0] ? `${import.meta.env.BASE_URL}${carro.fotosUrls[0]}` : placeholderSrc;
  
  if (!carro) {
    return (
      <div className="carro-card" style={{border: '1px dashed #ccc', textAlign: 'center', padding: '20px'}}>
          <p>Erro ao carregar dados do veículo.</p>
      </div>
    );
  }

  const isFavorited = interestIds.includes(carro.id);

  const handleCardClick = () => {
    navigate(`/carro/${carro.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); 
    if (!isLoggedIn) {
        alert("Você precisa estar logado para favoritar um veículo.");
        navigate('/login');
        return;
    }
    toggleInterest(carro.id);
  };

  return (
    <div className="carro-card" onClick={handleCardClick} role="button" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter') handleCardClick(); }}>
      <button className="btn-favorite" onClick={handleFavoriteClick} aria-label={isFavorited ? "Desfavoritar" : "Favoritar"}>
        <svg viewBox="0 0 24 24" width="24" height="24" strokeWidth="1.5">
            {isFavorited ? (
                <path className="heart-filled" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            ) : (
                <path className="heart-outline" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
            )}
        </svg>
      </button>

      <img src={fotoAtual} alt={`Foto de ${carro.nome}`} onError={(e) => { e.target.src = placeholderSrc; }} />
      <h3>{carro.nome || "Nome Indisponível"}</h3>
      <p className="info">
        {(carro.marca || "Marca Indisponível")} - {(carro.ano || "Ano Indisponível")}
      </p>
      <p className="descricao">
        {(carro.descricao || "Descrição não disponível.")}
      </p>
      <p className="preco">
        {(carro.preco || "Preço Indisponível")}
      </p>
    </div>
  );
}

export default CarCard;