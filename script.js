document.addEventListener('DOMContentLoaded', function() {
    const placeholderFallback = "placeholder_img/placeholder-400x300_fallback.png";
    
    const vitrineCarros = document.getElementById('vitrine-carros');
    const paginacaoContainer = document.getElementById('paginacao');
    const itensPorPagina = 12;
    let paginaAtual = 1;
    const slideshowState = {}; // Para guardar estado (intervalo, index) de CADA card
    let todosOsCarros = []; 

    async function carregarCarrosEIniciar() {
        if(vitrineCarros) vitrineCarros.innerHTML = '<p style="text-align: center; padding: 30px;">Carregando veículos...</p>';
        try {
            const response = await fetch('dados/carros.json');
            if (!response.ok) {
                throw new Error(`Erro HTTP ao carregar carros.json: ${response.status}`);
            }
            todosOsCarros = await response.json();
            
            if (vitrineCarros) {
                exibirCarrosDaPagina(paginaAtual);
            } else {
                console.error("Elemento #vitrine-carros não encontrado após carregar dados!");
            }
        } catch (error) {
            console.error('Falha ao carregar ou processar carros.json:', error);
            if (vitrineCarros) {
                vitrineCarros.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar dados dos veículos. Verifique o console.</p>';
            }
        }
    }

    function exibirCarrosDaPagina(pagina) {
        if (!vitrineCarros) { console.error("#vitrine-carros não encontrado."); return; }
        vitrineCarros.innerHTML = ''; 
        if (todosOsCarros.length === 0 && !vitrineCarros.textContent.includes("Erro")) {
             vitrineCarros.innerHTML = '<p style="text-align: center;">Nenhum carro disponível no momento.</p>';
             if(paginacaoContainer) paginacaoContainer.innerHTML = '';
             return;
        }

        paginaAtual = pagina;
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const carrosDaPagina = todosOsCarros.slice(inicio, fim);

        carrosDaPagina.forEach(carro => {
            const card = document.createElement('div');
            card.className = 'carro-card';
            card.dataset.carroId = carro.id;
            card.addEventListener('click', () => { window.location.href = `detalhe.html?id=${carro.id}`; });

            // Inicializa o estado do slideshow para este card se ainda não existir
            if (!slideshowState[carro.id]) {
                slideshowState[carro.id] = {
                    intervalId: null,
                    currentIndex: 0
                };
            }
            let estadoAtualSlide = slideshowState[carro.id];

            const imagemElement = document.createElement('img');
            const fotoInicial = (carro.fotosUrls && carro.fotosUrls.length > 0 && carro.fotosUrls[0]) ? carro.fotosUrls[0] : placeholderFallback;
            imagemElement.src = fotoInicial;
            estadoAtualSlide.currentIndex = 0; // Garante que começamos com o índice 0
            imagemElement.alt = `Foto de ${carro.nome}`;
            imagemElement.onerror = function() { this.src = placeholderFallback; this.alt = `Erro ${carro.nome}.`; };

            const nomeElement = document.createElement('h3'); nomeElement.textContent = carro.nome;
            const infoElement = document.createElement('p'); infoElement.className = 'info'; infoElement.textContent = `${carro.marca} - ${carro.ano}`;
            const descricaoElement = document.createElement('p'); descricaoElement.className = 'descricao'; descricaoElement.textContent = carro.descricao;
            const precoElement = document.createElement('p'); precoElement.className = 'preco'; precoElement.textContent = carro.preco;

            card.appendChild(imagemElement); card.appendChild(nomeElement); card.appendChild(infoElement); card.appendChild(descricaoElement); card.appendChild(precoElement);
            
            card.addEventListener('mouseenter', () => {
                if (carro.fotosUrls && carro.fotosUrls.length > 1) {
                    clearInterval(estadoAtualSlide.intervalId); // Limpa intervalo anterior para este card
                    estadoAtualSlide.intervalId = setInterval(() => {
                        estadoAtualSlide.currentIndex = (estadoAtualSlide.currentIndex + 1) % carro.fotosUrls.length;
                        imagemElement.src = carro.fotosUrls[estadoAtualSlide.currentIndex];
                        imagemElement.onerror = function() { this.src = placeholderFallback; };
                    }, 1000); // << ALTERADO PARA 1000ms (1 SEGUNDO)
                }
            });

            card.addEventListener('mouseleave', () => {
                clearInterval(estadoAtualSlide.intervalId);
                estadoAtualSlide.intervalId = null; // Marca que não há intervalo ativo
                estadoAtualSlide.currentIndex = 0; // Reseta o índice para a primeira imagem
                // Define a imagem de volta para a primeira do array fotosUrls do carro
                const primeiraFotoAoSair = (carro.fotosUrls && carro.fotosUrls.length > 0 && carro.fotosUrls[0]) 
                                        ? carro.fotosUrls[0] 
                                        : placeholderFallback;
                imagemElement.src = primeiraFotoAoSair;
                imagemElement.onerror = function() { this.src = placeholderFallback; };
            });
            vitrineCarros.appendChild(card);
        });
        configurarPaginacao();
    }

    function configurarPaginacao() {
        if (!paginacaoContainer) { return; }
        paginacaoContainer.innerHTML = '';
        if (todosOsCarros.length === 0) return;
        const totalPaginas = Math.ceil(todosOsCarros.length / itensPorPagina);
        if (totalPaginas <= 1) { return; }
        if (paginaAtual > 1) { paginacaoContainer.appendChild(criarBotaoPaginacao('Anterior', () => exibirCarrosDaPagina(paginaAtual - 1)));}
        for (let i = 1; i <= totalPaginas; i++) { paginacaoContainer.appendChild(criarBotaoPaginacao(i, () => exibirCarrosDaPagina(i), i === paginaAtual));}
        if (paginaAtual < totalPaginas) { paginacaoContainer.appendChild(criarBotaoPaginacao('Próxima', () => exibirCarrosDaPagina(paginaAtual + 1)));}
    }
    
    function criarBotaoPaginacao(texto, callback, desabilitado = false) {
        const botao = document.createElement('button'); botao.textContent = texto;
        botao.addEventListener('click', () => { callback(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        if (desabilitado) { botao.disabled = true; } return botao;
    }

    const btnMenu = document.getElementById('btn-menu');
    const navMenu = document.getElementById('nav-menu');
    if (btnMenu && navMenu) {
        btnMenu.addEventListener('click', () => {
            const isExpanded = navMenu.classList.toggle('ativo');
            btnMenu.setAttribute('aria-expanded', isExpanded);
        });
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('ativo') && !navMenu.contains(event.target) && !btnMenu.contains(event.target)) {
                navMenu.classList.remove('ativo');
                btnMenu.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        console.error("Erro: Elementos do menu #btn-menu ou #nav-menu não encontrados em index.html.");
    }

    carregarCarrosEIniciar();
});