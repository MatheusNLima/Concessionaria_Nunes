import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../detalhe.css';

function DetailPage({ todosOsCarros }) {
  const { carroId } = useParams();
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  const [interesseMarcado, setInteresseMarcado] = useState(false);
  
  const placeholderSrcGlobal = `${import.meta.env.BASE_URL}placeholder_img/placeholder-400x300_fallback.png`;

  useEffect(() => {
    if (todosOsCarros.length > 0) {
      const idNumerico = parseInt(carroId, 10);
      const encontrado = todosOsCarros.find(c => c.id === idNumerico);
      setCarroSelecionado(encontrado);
      
      if (encontrado?.fotosUrls?.[0]) {
        setImagemPrincipal(`${import.meta.env.BASE_URL}${encontrado.fotosUrls[0]}`);
      } else if (encontrado) {
        setImagemPrincipal(placeholderSrcGlobal);
      }
    }
  }, [carroId, todosOsCarros, placeholderSrcGlobal]);

  useEffect(() => {
    const fetchEstadoInteresse = async () => {
        if (!carroSelecionado) return;
        const token = localStorage.getItem('userToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
            const response = await fetch('https://concessionaria-nunes.onrender.com/api/interesses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao verificar interesses.');

            const idsInteresse = await response.json();
            setInteresseMarcado(idsInteresse.includes(carroSelecionado.id));
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    document.title = carroSelecionado ? `${carroSelecionado.nome} - Detalhes` : 'Veículo não encontrado';
    fetchEstadoInteresse();
  }, [carroSelecionado]);

  const toggleInteresse = async () => {
    if (!localStorage.getItem('userToken')) {
        alert("Você precisa estar logado para marcar interesse!");
        return;
    }

    const token = localStorage.getItem('userToken');
    const proximoEstado = !interesseMarcado;
    const method = proximoEstado ? 'POST' : 'DELETE';
    
    try {
        const response = await fetch('https://concessionaria-nunes.onrender.com/api/interesses', {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Ação de interesse falhou.');
        setInteresseMarcado(proximoEstado);
    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro. Tente novamente.');
    }
  };

  if (todosOsCarros.length > 0 && !carroSelecionado) {
    return (
      <div id="detalhe-carro-container" style={{ textAlign: 'center', padding: '50px' }}>
        <p className="mensagem-feedback">Carro com ID {carroId} não encontrado.</p>
        <Link to="/" className="btn-voltar-home">« Voltar para a Vitrine</Link>
      </div>
    );
  }
  
  return carroSelecionado && (
    <div id="detalhe-carro-container">
      <div className="detalhe-carro-grid">
        <div className="detalhe-imagens">
          <img
            id="imagem-principal-detalhe"
            src={imagemPrincipal}
            alt={`Foto principal de ${carroSelecionado.nome}`}
            onError={(e) => { e.target.onerror = null; e.target.src = placeholderSrcGlobal; }} 
          />
          {carroSelecionado.fotosUrls && carroSelecionado.fotosUrls.length > 1 && (
            <div className="miniaturas">
              {carroSelecionado.fotosUrls.map((fotoUrlRelativa, index) => (
                  <img
                    key={index}
                    src={`${import.meta.env.BASE_URL}${fotoUrlRelativa}`}
                    alt={`Miniatura ${index + 1} de ${carroSelecionado.nome}`}
                    onClick={() => setImagemPrincipal(`${import.meta.env.BASE_URL}${fotoUrlRelativa}`)}
                    className={`${import.meta.env.BASE_URL}${fotoUrlRelativa}` === imagemPrincipal ? 'ativa' : ''}
                    onError={(e) => {e.target.style.display='none';}}
                  />
                ))}
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
            disabled={isLoading}
          >
            {interesseMarcado ? '✓ Interesse Marcado' : 'Tenho Interesse!'}
          </button>
        </div>
      </div>
      <div className="botoes-navegacao-detalhe">
        <Link to="/" className="btn-voltar-pagina">« Voltar para Vitrine</Link>
        <Link to="/interesses" className="btn-ver-interesses">Ver Meus Interesses</Link>
      </div>
    </div>
  );
}

export default DetailPage;