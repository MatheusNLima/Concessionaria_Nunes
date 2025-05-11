import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function CarCard({ carro }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const placeholderFallbackCard = "/placeholder_img/placeholder-400x300_fallback.png";
  const navigate = useNavigate();

  useEffect(() => {
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); }};
  }, []);

  const handleMouseEnter = () => {
    if (carro.fotosUrls && carro.fotosUrls.length > 1) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % carro.fotosUrls.length);
      }, 1000);
    }
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setCurrentIndex(0);
  };

  const handleCardClick = () => {
    navigate(`/carro/${carro.id}`);
  };

  const fotoAtual = (carro.fotosUrls && carro.fotosUrls.length > 0 && carro.fotosUrls[currentIndex]) 
                    ? carro.fotosUrls[currentIndex] 
                    : placeholderFallbackCard;

  if (!carro) {
    return (
        <div className="carro-card" style={{border: '1px dashed #ccc', textAlign: 'center', padding: '20px'}}>
            <p>Erro ao carregar dados do veículo.</p>
        </div>
    );
  }

  return (
    <div 
        className="carro-card" 
        data-carro-id={carro.id} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        role="button" 
        tabIndex={0} 
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }} 
    >
      <img 
        src={fotoAtual}
        alt={`Foto de ${carro.nome}`} 
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = placeholderFallbackCard; 
        }}
      />
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