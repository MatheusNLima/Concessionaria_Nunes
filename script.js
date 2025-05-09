document.addEventListener('DOMContentLoaded', function() {
    const placeholderFallback = "placeholder_img/placeholder-400x300_fallback.png";
    
    const vitrineCarros = document.getElementById('vitrine-carros');
    const paginacaoContainer = document.getElementById('paginacao');
    const itensPorPagina = 12;
    let paginaAtual = 1;
    const slideshowState = {};
    let todosOsCarros = []; 
    let carrosFiltrados = []; 

    const searchBar = document.getElementById('search-bar');
    const searchBtn = document.getElementById('search-btn');
    const header = document.querySelector('header');
    // Garante que temos uma referência à mensagem de feedback
    let mensagemFeedback = document.querySelector('#vitrine-carros .mensagem-feedback'); 
    if (!mensagemFeedback && vitrineCarros) { // Se não existir, cria e injeta
        const p = document.createElement('p');
        p.className = 'mensagem-feedback';
        Object.assign(p.style, { display: 'none', width: '100%', textAlign: 'center', padding: '30px 20px' });
        vitrineCarros.parentNode.insertBefore(p, vitrineCarros); // Insere ANTES da vitrine
        mensagemFeedback = p;
    }


    async function carregarCarrosEIniciar() {
        // Mover a mensagem de carregamento para dentro da vitrine é melhor, pois será limpa.
        if (vitrineCarros) vitrineCarros.innerHTML = '<p style="text-align: center; padding: 30px;">Carregando veículos...</p>';
        if (mensagemFeedback) mensagemFeedback.style.display = 'none'; // Esconde feedback inicial

        try {
            const response = await fetch('dados/carros.json');
            if (!response.ok) { throw new Error(`Erro HTTP: ${response.status}`); }
            todosOsCarros = await response.json();
            carrosFiltrados = [...todosOsCarros]; 
            
            if (vitrineCarros) {
                exibirCarrosDaPagina(paginaAtual);
            }
        } catch (error) {
            console.error('Falha ao carregar carros.json:', error);
            if (vitrineCarros) vitrineCarros.innerHTML = ''; // Limpa msg "Carregando..."
            if (mensagemFeedback) {
                mensagemFeedback.textContent = 'Erro ao carregar dados dos veículos. Tente novamente mais tarde.';
                mensagemFeedback.style.display = 'block';
            }
        }
    }

    function exibirCarrosDaPagina(pagina, listaDeCarros = carrosFiltrados) {
        if (!vitrineCarros) { console.error("#vitrine-carros não encontrado."); return; }
        vitrineCarros.innerHTML = ''; // Limpa carros anteriores OU a mensagem de "carregando..."
        if (mensagemFeedback) mensagemFeedback.style.display = 'none'; // Sempre esconde msg de feedback antes de decidir se mostra

        if (listaDeCarros.length === 0) {
            let msg = 'Nenhum carro disponível no momento.'; // Mensagem padrão
            if (searchBar && searchBar.value.trim() !== '') { 
                msg = `Nenhum veículo encontrado para "${searchBar.value.trim()}".`;
            } else if (todosOsCarros.length === 0 && !vitrineCarros.textContent.includes("Erro")) {
                // Não há carros na base, e não foi um erro de carregamento
                // A mensagem padrão "Nenhum carro disponível..." já é adequada.
            }
            // A mensagem de erro de carregamento do catch já seria exibida pelo mensagemFeedback

            if (mensagemFeedback) {
                mensagemFeedback.textContent = msg;
                mensagemFeedback.style.display = 'block';
                vitrineCarros.appendChild(mensagemFeedback); // Adiciona a mensagem dentro da vitrine vazia
            } else { // Fallback se o elemento p não foi criado
                vitrineCarros.innerHTML = `<p style="text-align: center; padding: 30px;">${msg}</p>`;
            }
            if(paginacaoContainer) paginacaoContainer.innerHTML = '';
            return;
        }
        
        // (o restante da função exibirCarrosDaPagina, criando cards, é igual à versão anterior)
        // ...
        paginaAtual = pagina;
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const carrosDaPagina = listaDeCarros.slice(inicio, fim);

        carrosDaPagina.forEach(carro => {
            const card = document.createElement('div');
            card.className = 'carro-card';
            card.dataset.carroId = carro.id;
            card.addEventListener('click', () => { window.location.href = `detalhe.html?id=${carro.id}`; });

            if (!slideshowState[carro.id]) { slideshowState[carro.id] = { intervalId: null, currentIndex: 0 }; }
            let estadoAtualSlide = slideshowState[carro.id];

            const imagemElement = document.createElement('img');
            const fotoInicial = (carro.fotosUrls && carro.fotosUrls.length > 0 && carro.fotosUrls[0]) ? carro.fotosUrls[0] : placeholderFallback;
            imagemElement.src = fotoInicial;
            estadoAtualSlide.currentIndex = 0;
            imagemElement.alt = `Foto de ${carro.nome}`;
            imagemElement.onerror = function() { this.src = placeholderFallback; this.alt = `Erro ${carro.nome}.`; };

            const nomeElement = document.createElement('h3'); nomeElement.textContent = carro.nome;
            const infoElement = document.createElement('p'); infoElement.className = 'info'; infoElement.textContent = `${carro.marca} - ${carro.ano}`;
            const descricaoElement = document.createElement('p'); descricaoElement.className = 'descricao'; descricaoElement.textContent = carro.descricao;
            const precoElement = document.createElement('p'); precoElement.className = 'preco'; precoElement.textContent = carro.preco;

            card.appendChild(imagemElement); card.appendChild(nomeElement); card.appendChild(infoElement); card.appendChild(descricaoElement); card.appendChild(precoElement);
            
            card.addEventListener('mouseenter', () => {
                if (carro.fotosUrls && carro.fotosUrls.length > 1) {
                    clearInterval(estadoAtualSlide.intervalId);
                    estadoAtualSlide.intervalId = setInterval(() => {
                        estadoAtualSlide.currentIndex = (estadoAtualSlide.currentIndex + 1) % carro.fotosUrls.length;
                        imagemElement.src = carro.fotosUrls[estadoAtualSlide.currentIndex];
                        imagemElement.onerror = function() { this.src = placeholderFallback; };
                    }, 1000);
                }
            });
            card.addEventListener('mouseleave', () => {
                clearInterval(estadoAtualSlide.intervalId); estadoAtualSlide.intervalId = null; estadoAtualSlide.currentIndex = 0;
                const primeiraFoto = (carro.fotosUrls && carro.fotosUrls.length > 0 && carro.fotosUrls[0]) ? carro.fotosUrls[0] : placeholderFallback;
                imagemElement.src = primeiraFoto;
                imagemElement.onerror = function() { this.src = placeholderFallback; };
            });
            vitrineCarros.appendChild(card);
        });
        configurarPaginacao(listaDeCarros);
    }

    // (Funções configurarPaginacao, criarBotaoPaginacao, lógica da busca, lógica do menu - permanecem iguais)
    // ...
    function configurarPaginacao(listaDeCarros = carrosFiltrados) { 
        if (!paginacaoContainer) { return; }
        paginacaoContainer.innerHTML = '';
        if (listaDeCarros.length === 0) return; 
        const totalPaginas = Math.ceil(listaDeCarros.length / itensPorPagina);
        if (totalPaginas <= 1) { return; }
        if (paginaAtual > 1) { paginacaoContainer.appendChild(criarBotaoPaginacao('Anterior', () => exibirCarrosDaPagina(paginaAtual - 1, listaDeCarros)));}
        for (let i = 1; i <= totalPaginas; i++) { paginacaoContainer.appendChild(criarBotaoPaginacao(i, () => exibirCarrosDaPagina(i, listaDeCarros), i === paginaAtual));}
        if (paginaAtual < totalPaginas) { paginacaoContainer.appendChild(criarBotaoPaginacao('Próxima', () => exibirCarrosDaPagina(paginaAtual + 1, listaDeCarros)));}
    }
    function criarBotaoPaginacao(texto, callback, desabilitado = false) { 
        const botao = document.createElement('button'); botao.textContent = texto;
        botao.addEventListener('click', () => { callback(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        if (desabilitado) { botao.disabled = true; } return botao;
    }

    if (searchBar && searchBtn && header) {
        searchBtn.addEventListener('click', (event) => {
            event.stopPropagation(); 
            const isMobile = window.innerWidth <= 768; 
            if (isMobile) {
                const searchBarAtiva = searchBar.classList.toggle('ativo');
                header.classList.toggle('search-active', searchBarAtiva); 
                if (searchBarAtiva) { searchBar.focus(); }
            } else { realizarBusca(); }
        });
        searchBar.addEventListener('input', realizarBusca);
        searchBar.addEventListener('click', (event) => { event.stopPropagation(); });
        document.addEventListener('click', function(event) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile && searchBar.classList.contains('ativo')) {
                if (!searchBar.contains(event.target) && !searchBtn.contains(event.target)) {
                    searchBar.classList.remove('ativo');
                    header.classList.remove('search-active');
                }
            }
        });
    }
    function realizarBusca() {
        const termoBusca = searchBar.value.trim().toLowerCase();
        carrosFiltrados = todosOsCarros.filter(carro => 
            carro.nome.toLowerCase().includes(termoBusca) ||
            carro.marca.toLowerCase().includes(termoBusca)
        );
        paginaAtual = 1; 
        exibirCarrosDaPagina(paginaAtual, carrosFiltrados);
    }
    const btnMenu = document.getElementById('btn-menu');
    const navMenu = document.getElementById('nav-menu');
    if (btnMenu && navMenu && header) { 
        btnMenu.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = navMenu.classList.toggle('ativo');
            btnMenu.setAttribute('aria-expanded', isExpanded);
            if (window.innerWidth <= 768 && searchBar && searchBar.classList.contains('ativo')) {
                searchBar.classList.remove('ativo');
                header.classList.remove('search-active');
            }
        });
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('ativo') && !navMenu.contains(event.target) && !btnMenu.contains(event.target)) {
                navMenu.classList.remove('ativo');
                btnMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }

    carregarCarrosEIniciar();
});