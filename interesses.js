document.addEventListener('DOMContentLoaded', function() {
    const vitrineInteresses = document.getElementById('vitrine-interesses');
    const mensagemInicialInteresses = document.querySelector('.mensagem-inicial-interesses');
    // Garante que temos uma referência à mensagem de feedback ou a cria
    let mensagemFeedbackInteresses = document.querySelector('#vitrine-interesses .mensagem-feedback-interesses');
    if (!mensagemFeedbackInteresses && vitrineInteresses) {
        const p = document.createElement('p');
        p.className = 'mensagem-feedback-interesses'; // Usar a classe definida no HTML se houver
        Object.assign(p.style, { display: 'none', width: '100%', textAlign: 'center', padding: '30px 20px' });
        vitrineInteresses.parentNode.insertBefore(p, vitrineInteresses); // Insere ANTES da vitrine de interesses
        mensagemFeedbackInteresses = p;
    }
    
    const paginacaoContainerInteresses = document.getElementById('paginacao-interesses'); 
    const placeholderFallbackGlobal = "placeholder_img/placeholder-400x300_fallback.png";
    const itensPorPagina = 12; 
    let paginaAtualInteresses = 1;
    let todosOsCarrosGeral = []; 
    let carrosInteressadosBase = []; 
    let carrosInteressadosFiltrados = [];

    const searchBarInteresses = document.getElementById('search-bar-interesses');
    const searchBtnInteresses = document.getElementById('search-btn-interesses');
    const headerInteresses = document.querySelector('header');

    async function carregarDadosEListarInteresses() {
        if(mensagemInicialInteresses) mensagemInicialInteresses.style.display = 'block';
        if(mensagemFeedbackInteresses) mensagemFeedbackInteresses.style.display = 'none';
        if (vitrineInteresses) vitrineInteresses.innerHTML = '';
        if (paginacaoContainerInteresses) paginacaoContainerInteresses.innerHTML = '';

        try {
            const response = await fetch('dados/carros.json');
            if (!response.ok) { throw new Error(`Erro HTTP: ${response.status}`); }
            todosOsCarrosGeral = await response.json();
            
            const idsInteresseDoLocalStorage = JSON.parse(localStorage.getItem('carrosInteresse')) || [];
            
            if (idsInteresseDoLocalStorage.length === 0) {
                if (mensagemInicialInteresses) mensagemInicialInteresses.style.display = 'none';
                if (mensagemFeedbackInteresses) { mensagemFeedbackInteresses.textContent = "Você ainda não marcou nenhum veículo como interesse."; mensagemFeedbackInteresses.style.display = 'block';}
                if (vitrineInteresses) vitrineInteresses.appendChild(mensagemFeedbackInteresses); // Adiciona se não estiver lá
            } else {
                carrosInteressadosBase = todosOsCarrosGeral.filter(carro => idsInteresseDoLocalStorage.includes(carro.id));
                carrosInteressadosFiltrados = [...carrosInteressadosBase];
                
                if (mensagemInicialInteresses) mensagemInicialInteresses.style.display = 'none';

                if (carrosInteressadosFiltrados.length === 0) {
                    if (mensagemFeedbackInteresses) { 
                        mensagemFeedbackInteresses.textContent = "Nenhum dos seus veículos de interesse foi encontrado na lista atual."; 
                        mensagemFeedbackInteresses.style.display = 'block';
                        if (vitrineInteresses && !vitrineInteresses.contains(mensagemFeedbackInteresses)) {
                             vitrineInteresses.appendChild(mensagemFeedbackInteresses);
                        }
                    }
                } else {
                    exibirCarrosDeInteresseDaPagina(paginaAtualInteresses);
                }
            }
        } catch (error) {
            console.error('Falha ao carregar dados ou listar interesses:', error);
            if (mensagemInicialInteresses) mensagemInicialInteresses.style.display = 'none';
            if (mensagemFeedbackInteresses) { 
                mensagemFeedbackInteresses.textContent = "Erro ao carregar seus veículos de interesse."; 
                mensagemFeedbackInteresses.style.display = 'block';
                 if (vitrineInteresses && !vitrineInteresses.contains(mensagemFeedbackInteresses)) {
                    vitrineInteresses.appendChild(mensagemFeedbackInteresses);
                }
            }
        }
    }
    
    function exibirCarrosDeInteresseDaPagina(pagina, listaDeCarros = carrosInteressadosFiltrados) {
        if (!vitrineInteresses) { console.error("#vitrine-interesses não encontrado."); return; }
        vitrineInteresses.innerHTML = ''; 
        if (mensagemFeedbackInteresses) mensagemFeedbackInteresses.style.display = 'none';
        if (mensagemInicialInteresses) mensagemInicialInteresses.style.display = 'none'; // Garante que msg inicial suma

        if (listaDeCarros.length === 0) {
            let msg = 'Você não tem veículos de interesse ou nenhum corresponde aos critérios.';
            if (searchBarInteresses && searchBarInteresses.value.trim() !== '') { 
                 msg = `Nenhum veículo de interesse encontrado para "${searchBarInteresses.value.trim()}".`;
            } else if (carrosInteressadosBase.length === 0) { // Se a lista base de interesses já estava vazia
                msg = 'Você ainda não marcou nenhum veículo como interesse.';
            }

            if (mensagemFeedbackInteresses) {
                mensagemFeedbackInteresses.textContent = msg;
                mensagemFeedbackInteresses.style.display = 'block';
                vitrineInteresses.appendChild(mensagemFeedbackInteresses);
            } else {
                vitrineInteresses.innerHTML = `<p style="text-align: center; padding: 30px;">${msg}</p>`;
            }
            if(paginacaoContainerInteresses) paginacaoContainerInteresses.innerHTML = '';
            return;
        }
        const pMensagemExistente = vitrineInteresses.querySelector('.mensagem-feedback-interesses, .mensagem-inicial-interesses');
        if(pMensagemExistente) pMensagemExistente.remove();
        
        // ... (Resto da função exibirCarrosDeInteresseDaPagina, criando cards, é igual à versão anterior)
        // ...
        paginaAtualInteresses = pagina;
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const carrosDaPagina = listaDeCarros.slice(inicio, fim);

        if(carrosDaPagina.length === 0 && listaDeCarros.length > 0 && pagina > 1) {
            exibirCarrosDeInteresseDaPagina(1, listaDeCarros); return;
        }

        carrosDaPagina.forEach(carro => { 
            const card = document.createElement('div'); card.className = 'carro-card'; card.dataset.carroId = carro.id;
            card.addEventListener('click', () => { window.location.href = `detalhe.html?id=${carro.id}`; });
            const imagemElement = document.createElement('img');
            const fotoInicial = (carro.fotosUrls && carro.fotosUrls.length > 0 && carro.fotosUrls[0]) ? carro.fotosUrls[0] : placeholderFallbackGlobal;
            imagemElement.src = fotoInicial; imagemElement.alt = `Foto de ${carro.nome}`;
            imagemElement.onerror = function() { this.src = placeholderFallbackGlobal; this.alt = `Erro ${carro.nome}.`; };
            const nomeElement = document.createElement('h3'); nomeElement.textContent = carro.nome;
            const infoElement = document.createElement('p'); infoElement.className = 'info'; infoElement.textContent = `${carro.marca} - ${carro.ano}`;
            const precoElement = document.createElement('p'); precoElement.className = 'preco'; precoElement.textContent = carro.preco;
            const btnRemoverInteresse = document.createElement('button'); btnRemoverInteresse.textContent = 'Remover Interesse';
            Object.assign(btnRemoverInteresse.style, { marginTop: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' });
            btnRemoverInteresse.addEventListener('click', (event) => { 
                event.stopPropagation();
                let idsAtuais = JSON.parse(localStorage.getItem('carrosInteresse')) || [];
                idsAtuais = idsAtuais.filter(id => id !== carro.id); 
                localStorage.setItem('carrosInteresse', JSON.stringify(idsAtuais));
                carrosInteressadosBase = todosOsCarrosGeral.filter(c => idsAtuais.includes(c.id));
                realizarBuscaInteresses(); 
            });
            card.appendChild(imagemElement); card.appendChild(nomeElement); card.appendChild(infoElement); card.appendChild(precoElement); card.appendChild(btnRemoverInteresse);
            vitrineInteresses.appendChild(card);
        });
        configurarPaginacaoInteresses(listaDeCarros);
    }
    
    // (Funções configurarPaginacaoInteresses, criarBotaoPaginacaoInteresses, lógica da busca para interesses, lógica do menu - permanecem iguais)
    // ...
    function configurarPaginacaoInteresses(listaDeCarros = carrosInteressadosFiltrados) { 
        if (!paginacaoContainerInteresses ) { return; } 
        paginacaoContainerInteresses.innerHTML = ''; 
        if (listaDeCarros.length === 0) { return; } 
        const totalPaginas = Math.ceil(listaDeCarros.length / itensPorPagina);
        if (totalPaginas <= 1) { return; } 
        if (paginaAtualInteresses > 1) { paginacaoContainerInteresses.appendChild(criarBotaoPaginacaoInteresses('Anterior', () => exibirCarrosDeInteresseDaPagina(paginaAtualInteresses - 1, listaDeCarros)));}
        for (let i = 1; i <= totalPaginas; i++) { paginacaoContainerInteresses.appendChild(criarBotaoPaginacaoInteresses(i, () => exibirCarrosDeInteresseDaPagina(i, listaDeCarros), i === paginaAtualInteresses));}
        if (paginaAtualInteresses < totalPaginas) { paginacaoContainerInteresses.appendChild(criarBotaoPaginacaoInteresses('Próxima', () => exibirCarrosDeInteresseDaPagina(paginaAtualInteresses + 1, listaDeCarros)));}
    }
    function criarBotaoPaginacaoInteresses(texto, callback, desabilitado = false) { 
        const botao = document.createElement('button'); botao.textContent = texto;
        botao.addEventListener('click', () => { callback(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        if (desabilitado) { botao.disabled = true; } return botao;
    }

    if (searchBarInteresses && searchBtnInteresses && headerInteresses) {
        searchBtnInteresses.addEventListener('click', (event) => {
            event.stopPropagation();
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                const searchBarAtiva = searchBarInteresses.classList.toggle('ativo');
                headerInteresses.classList.toggle('search-active', searchBarAtiva);
                if (searchBarAtiva) { searchBarInteresses.focus(); }
            } else { realizarBuscaInteresses(); }
        });
        searchBarInteresses.addEventListener('input', realizarBuscaInteresses);
        searchBarInteresses.addEventListener('click', (event) => { event.stopPropagation(); });
        document.addEventListener('click', function(event) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile && searchBarInteresses.classList.contains('ativo')) {
                if (!searchBarInteresses.contains(event.target) && !searchBtnInteresses.contains(event.target)) {
                    searchBarInteresses.classList.remove('ativo');
                    headerInteresses.classList.remove('search-active');
                }
            }
        });
    }
    function realizarBuscaInteresses() {
        const termoBusca = searchBarInteresses.value.trim().toLowerCase();
        carrosInteressadosFiltrados = carrosInteressadosBase.filter(carro => 
            carro.nome.toLowerCase().includes(termoBusca) ||
            carro.marca.toLowerCase().includes(termoBusca)
        );
        paginaAtualInteresses = 1; // Resetar para a primeira página ao buscar
        exibirCarrosDeInteresseDaPagina(paginaAtualInteresses, carrosInteressadosFiltrados); 
    }
    const btnMenuInteresses = document.getElementById('btn-menu');
    const navMenuInteresses = document.getElementById('nav-menu');
    if (btnMenuInteresses && navMenuInteresses) { 
        btnMenuInteresses.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = navMenuInteresses.classList.toggle('ativo');
            btnMenuInteresses.setAttribute('aria-expanded', isExpanded);
            if (window.innerWidth <= 768 && searchBarInteresses && searchBarInteresses.classList.contains('ativo')) {
                searchBarInteresses.classList.remove('ativo');
                if(headerInteresses) headerInteresses.classList.remove('search-active');
            }
        });
        document.addEventListener('click', function(event) {
            if (navMenuInteresses.classList.contains('ativo') && !navMenuInteresses.contains(event.target) && !btnMenuInteresses.contains(event.target)) {
                navMenuInteresses.classList.remove('ativo');
                navMenuInteresses.setAttribute('aria-expanded', 'false');
            }
        });
    }

    carregarDadosEListarInteresses();
});