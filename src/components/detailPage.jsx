import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../detalhe.css';

function DetailPage({ todosOsCarros }) {
  const { carroId } = useParams();
  const navigate = useNavigate();
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [loadingThisPage, setLoadingThisPage] = useState(true);
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  const [interesseMarcado, setInteresseMarcado] = useState(false);

  const placeholderSrcGlobal = `${import.meta.env.BASE_URL}placeholder_img/placeholder-400x300_fallback.png`;

  useEffect(() => {
    setLoadingThisPage(true);
    if (todosOsCarros && todosOsCarros.length > 0) {
      const idNumerico = parseInt(carroId, 10);
      const encontrado = todosOsCarros.find(c => c.id === idNumerico);
      setCarroSelecionado(encontrado);
      if (encontrado && encontrado.fotosUrls && encontrado.fotosUrls.length > 0) {
        setImagemPrincipal(`${import.meta.env.BASE_URL}${encontrado.fotosUrls[0]}`);
      } else if (encontrado) {
        setImagemPrincipal(placeholderSrcGlobal);
      }
      setLoadingThisPage(false);
    } else if (todosOsCarros && todosOsCarros.length === 0) {
        setCarroSelecionado(null);
        setLoadingThisPage(false);
    }
  }, [carroId, todosOsCarros, placeholderSrcGlobal]);

  useEffect(() => {
    if (carroSelecionado) {
      document.title = `${carroSelecionado.nome} - Detalhes - Concessionária Nunes`;
      const interesses = JSON.parse(localStorage.getItem('carrosInteresse')) || [];
      setInteresseMarcado(interesses.includes(carroSelecionado.id));
    } else if (!loadingThisPage) {
      document.title = "Veículo não encontrado - Concessionária Nunes";
    }
  }, [carroSelecionado, loadingThisPage]);

  const toggleInteresse = () => {
    if (!carroSelecionado) return;
    let interesses = JSON.parse(localStorage.getItem('carrosInteresse')) || [];
    const idCarro = carroSelecionado.id;
    if (interesses.includes(idCarro)) {
      interesses = interesses.filter(id => id !== idCarro);
      setInteresseMarcado(false);
    } else {
      interesses.push(idCarro);
      setInteresseMarcado(true);
    }
    localStorage.setItem('carrosInteresse', JSON.stringify(interesses));
  };

  if (loadingThisPage && !(todosOsCarros && todosOsCarros.length > 0)) {
    return <p style={{ textAlign: 'center', padding: '50px' }}>Carregando dados do veículo...</p>;
  }

  if (!carroSelecionado) {
    return (
      <div id="detalhe-carro-container" style={{ textAlign: 'center', padding: '50px' }}>
        <p className="mensagem-feedback" style={{display:'block', color: 'red' }}>Carro com ID {carroId} não encontrado.</p>
        <Link to="/" className="btn-voltar-home" style={{
            display: 'inline-block', padding: '10px 20px', backgroundColor: '#6c757d',
            color: 'white', textDecoration: 'none', borderRadius: '5px', marginTop: '20px'
            }}>
            « Voltar para a Vitrine
        </Link>
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
            onError={(e) => {e.target.onerror = null; e.target.src = placeholderSrcGlobal;}} 
          />
          {carroSelecionado.fotosUrls && carroSelecionado.fotosUrls.length > 1 && (
            <div className="miniaturas">
              {carroSelecionado.fotosUrls.map((fotoUrlRelativa, index) => {
                const fotoUrlCompleta = `${import.meta.env.BASE_URL}${fotoUrlRelativa}`;
                const miniaturaSrc = fotoUrlRelativa ? fotoUrlCompleta : placeholderSrcGlobal;
                return (
                  <img
                    key={index}
                    src={miniaturaSrc}
                    alt={`Miniatura ${index + 1} de ${carroSelecionado.nome}`}
                    onClick={() => setImagemPrincipal(fotoUrlCompleta)}
                    className={fotoUrlCompleta === imagemPrincipal ? 'ativa' : ''}
                    onError={(e) => {e.target.style.display='none';}}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className="detalhe-info">
          <h2>{carroSelecionado.nome}</h2>
          <p className="marca-ano">{carroSelecionado.marca} - {carroSelecionado.ano}</p>
          <p className="preco-detalhe">{carroSelecionado.preco}</p>
          <p className="descricao-completa">
            {carroSelecionado.descricao.split('\n').map((str, index, array) =>
              index === array.length - 1 ? str : <React.Fragment key={index}>{str}<br/></React.Fragment>
            )}
          </p>
          <button
            id="btn-add-interesse"
            className={`btn-interesse ${interesseMarcado ? 'marcado' : ''}`}
            onClick={toggleInteresse}
          >
            {interesseMarcado ? 'Remover Interesse' : 'Tenho Interesse!'}
          </button>
        </div>
      </div>
      <div className="botoes-navegacao-detalhe" style={{marginTop: '40px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px'}}>
        <Link to="/" className="btn-voltar-pagina" style={{
            padding: '10px 25px', backgroundColor: '#6c757d',
            color: 'white', textDecoration: 'none', borderRadius: '6px',
            fontSize: '1em', fontWeight: '500', fontFamily: "'Open Sans', sans-serif"
            }}>
            « Voltar para Vitrine
        </Link>
        <Link to="/interesses" className="btn-ver-interesses" style={{
            padding: '10px 25px', backgroundColor: '#007bff',
            color: 'white', textDecoration: 'none', borderRadius: '6px',
            fontSize: '1em', fontWeight: '500', fontFamily: "'Open Sans', sans-serif"
            }}>
            Ver Meus Interesses
        </Link>
      </div>
    </div>
  );
}

export default DetailPage;