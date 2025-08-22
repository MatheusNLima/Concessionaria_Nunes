import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../detalhe.css';

// ATENÇÃO: Adicionar todosOsCarros como prop para que possa ser enviado para a rota /chat
function DetailPage({ todosOsCarros }) { // <<-- O DETAILPAGE JÁ RECEBE ESTA PROP. BASTA USAR.
  const { carroId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, interestIds, toggleInterest } = useAuth();
  
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  const [descricaoGerada, setDescricaoGerada] = useState('');
  const [mostrarChat, setMostrarChat] = useState(false);
  const [mensagemChat, setMensagemChat] = useState('');
  const [respostaChat, setRespostaChat] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const placeholderSrcGlobal = `${import.meta.env.BASE_URL}placeholder_img/placeholder-400x300.png`; 
  const isFavorited = carroSelecionado ? interestIds.includes(carroSelecionado.id) : false;
  
  useEffect(() => {
    if (todosOsCarros.length > 0) {
      const idNumerico = parseInt(carroId, 10);
      const encontrado = todosOsCarros.find(c => c.id === idNumerico);
      setCarroSelecionado(encontrado);
      
      let fotoInicialUrl = '';
      if (encontrado?.fotosUrls?.[0]) {
          if (process.env.NODE_ENV === 'development') { 
              fotoInicialUrl = `${window.location.origin}${import.meta.env.BASE_URL}${encontrado.fotosUrls[0]}`;
          } else {
              fotoInicialUrl = `${import.meta.env.BASE_URL}${encontrado.fotosUrls[0]}`;
          }
      }
      const fotoInicial = fotoInicialUrl || placeholderSrcGlobal;
      
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

  const gerarDescricaoIA = async () => {
    try {
      setCarregando(true);
      const token = sessionStorage.getItem('userToken');
      const response = await fetch('/api/ia/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carroSelecionado)
      });
      
      const data = await response.json();
      if (response.ok) {
        setDescricaoGerada(data.descricao_gerada);
      } else {
        alert('Erro ao gerar descrição: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error("Erro em gerarDescricaoIA:", error); // Adicionei este log para capturar erros aqui
      alert('Erro de conexão ao gerar descrição');
    } finally {
      setCarregando(false);
    }
  };

  const enviarPergunta = async () => {
    if (!mensagemChat.trim() || carregando) return;
    
    try {
      setCarregando(true);
      const token = sessionStorage.getItem('userToken');
      const response = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carro_id: carroSelecionado.id,
          user_message: mensagemChat,
          carros_contexto: todosOsCarros // <<< MANDANDO O CONTEXTO COMPLETO DOS CARROS PARA O BACKEND
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setRespostaChat(data.resposta);
        setMensagemChat('');
      } else {
        alert('Erro no chat: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error("Erro em enviarPergunta:", error); // Adicionei este log para capturar erros aqui
      alert('Erro de conexão no chat');
    } finally {
      setCarregando(false);
    }
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
            onError={(e) => { 
                console.error(`Erro ao carregar imagem principal para ${carroSelecionado?.nome} (id: ${carroSelecionado?.id}): ${e.target.src}. Fallback para placeholder.`);
                e.target.src = placeholderSrcGlobal; 
            }} 
          />
          {carroSelecionado.fotosUrls && carroSelecionado.fotosUrls.length > 1 && (
            <div className="miniaturas">
              {carroSelecionado.fotosUrls.map((fotoUrlRelativa, index) => {
                let fotoUrlCompleta;
                if (process.env.NODE_ENV === 'development') { 
                    fotoUrlCompleta = `${window.location.origin}${import.meta.env.BASE_URL}${fotoUrlRelativa}`;
                } else {
                    fotoUrlCompleta = `${import.meta.env.BASE_URL}${fotoUrlRelativa}`;
                }
                return (
                  <img
                    key={index}
                    src={fotoUrlCompleta}
                    alt={`Miniatura ${index + 1}`}
                    onClick={() => setImagemPrincipal(fotoUrlCompleta)}
                    className={fotoUrlCompleta === imagemPrincipal ? 'ativa' : ''}
                    onError={(e) => { 
                        console.error(`Erro ao carregar miniatura #${index} para ${carroSelecionado?.nome}: ${e.target.src}. Ocultando miniatura.`);
                        e.target.style.display='none'; 
                    }}
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
      
      {isLoggedIn && (
        <div className="ia-actions" style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #eee' }}>
          <h3>Recursos de IA</h3>
          
          <button 
            onClick={gerarDescricaoIA} 
            disabled={carregando}
            className="btn-ia"
          >
            {carregando ? 'Gerando...' : '✨ Gerar Descrição com IA'}
          </button>
          
          <button 
            onClick={() => setMostrarChat(!mostrarChat)} 
            className="btn-ia"
          >
            {mostrarChat ? 'Fechar Chat' : '💬 Perguntar sobre este carro'}
          </button>
          
          {descricaoGerada && (
            <div className="descricao-gerada" style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              borderLeft: '4px solid #007bff'
            }}>
              <h4>Descrição Gerada por IA:</h4>
              <p>{descricaoGerada}</p>
            </div>
          )}
          
          {mostrarChat && (
            <div className="chat-ia" style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px' 
            }}>
              <h4>Pergunte sobre este {carroSelecionado.nome}</h4>
              
              {respostaChat && (
                <div className="resposta-ia" style={{ 
                  padding: '10px', 
                  backgroundColor: '#e7f3ff', 
                  borderRadius: '6px', 
                  marginBottom: '15px' 
                }}>
                  <strong>IA:</strong> {respostaChat}
                </div>
              )}
              
              <div className="chat-input" style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={mensagemChat}
                  onChange={(e) => setMensagemChat(e.target.value)}
                  placeholder="Ex: Qual o consumo de combustível?"
                  onKeyPress={(e) => e.key === 'Enter' && enviarPergunta()}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ced4da' }}
                  disabled={carregando}
                />
                <button 
                  onClick={enviarPergunta}
                  disabled={carregando || !mensagemChat.trim()}
                  style={{ 
                    padding: '10px 15px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: carregando ? 'not-allowed' : 'pointer'
                  }}
                >
                  {carregando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DetailPage;