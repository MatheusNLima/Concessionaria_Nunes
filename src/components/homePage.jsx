import React, { useState, useEffect } from 'react';
import CarCard from './carCard';

function HomePage({ todosOsCarrosOriginal, termoBuscaAtual }) {
    const itensPorPagina = 12;
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carrosFiltrados, setCarrosFiltrados] = useState([]);
    document.title = "consessionária Nunes";

    useEffect(() => {
        let filtrados = todosOsCarrosOriginal || [];
        if (termoBuscaAtual && termoBuscaAtual.trim() !== '') {
            const termo = termoBuscaAtual.toLowerCase();
            filtrados = (todosOsCarrosOriginal || []).filter(carro =>
                carro.nome.toLowerCase().includes(termo) ||
                carro.marca.toLowerCase().includes(termo)
            );
        }
        setCarrosFiltrados(filtrados);
        setPaginaAtual(1);
    }, [todosOsCarrosOriginal, termoBuscaAtual]);

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
        if (paginaAtual > 1) {
            botoes.push(<button key="anterior" onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>);
        }
        for (let i = 1; i <= totalPaginas; i++) {
            botoes.push(
                <button key={i} onClick={() => mudarPagina(i)} disabled={i === paginaAtual}>
                    {i}
                </button>
            );
        }
        if (paginaAtual < totalPaginas) {
            botoes.push(<button key="proxima" onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>);
        }
        return botoes;
    };
    const semCarrosOriginalmente = !todosOsCarrosOriginal || todosOsCarrosOriginal.length === 0;
    return (
        <div>
            <h2>Nossos Veículos</h2>
            <div id="vitrine-carros">
                {carrosFiltrados.length > 0 ? (
                    carrosDaPaginaAtual.map(carro => (
                        <CarCard key={carro.id} carro={carro} />
                    ))
                ) : (
                    <p className="mensagem-feedback" style={{display: 'block'}}>
                        {termoBuscaAtual && termoBuscaAtual.trim() !== '' 
                            ? `Nenhum veículo encontrado para "${termoBuscaAtual}".` 
                            : (semCarrosOriginalmente ? "Nenhum veículo disponível no momento." : "Nenhum veículo corresponde aos critérios.")
                        }
                    </p>
                )}
            </div>
            <div id="paginacao">
                {carrosFiltrados.length > 0 && renderizarBotoesPaginacao()}
            </div>
        </div>
    );
}

export default HomePage;