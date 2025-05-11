import React, { useState, useEffect, useRef } from 'react';

function Header({ termoBusca, onBuscaChange, onNavigateHome, onNavigateInteresses }) {
        const [menuAtivo, setMenuAtivo] = useState(false);
        const [buscaBarraAtivaMobile, setBuscaBarraAtivaMobile] = useState(false);
        const headerElementRef = useRef(null);
        const searchBarRef = useRef(null);
        useEffect(() => {
            headerElementRef.current = document.querySelector('header');
        }, []);

        const toggleMenu = (event) => {
            event.stopPropagation();
            setMenuAtivo(prev => !prev);
            if (buscaBarraAtivaMobile && headerElementRef.current) {
                setBuscaBarraAtivaMobile(false);
                headerElementRef.current.classList.remove('search-active');
            }
        };

        const handleSearchInputChange = (event) => {
            if (onBuscaChange) {
                onBuscaChange(event.target.value);
            }
        };

        const handleSearchBtnClick = (event) => {
            event.stopPropagation();
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                const novaBuscaAtiva = !buscaBarraAtivaMobile;
                setBuscaBarraAtivaMobile(novaBuscaAtiva);
                if (headerElementRef.current) {
                    headerElementRef.current.classList.toggle('search-active', novaBuscaAtiva);
                }
                if (novaBuscaAtiva && searchBarRef.current) {
                    searchBarRef.current.focus();
                }
                if (menuAtivo && novaBuscaAtiva) {
                    setMenuAtivo(false);
                }
            } else {
                if (searchBarRef.current) searchBarRef.current.focus();
                if (onBuscaChange && searchBarRef.current) {
                    onBuscaChange(searchBarRef.current.value);
                }
            }
        };
        
        useEffect(() => {
            const handleClickFora = (event) => {
                const searchContainerNode = headerElementRef.current?.querySelector('.search-container');
                const isMobile = window.innerWidth <= 768;

                if (isMobile && buscaBarraAtivaMobile && searchContainerNode && !searchContainerNode.contains(event.target)) {
                    const searchBtnNode = document.getElementById('header-search-btn');
                    if (searchBtnNode && !searchBtnNode.contains(event.target)) { 
                        setBuscaBarraAtivaMobile(false);
                        if(headerElementRef.current) headerElementRef.current.classList.remove('search-active');
                    }
                }
            };
            
            if (buscaBarraAtivaMobile && window.innerWidth <= 768) {
                document.addEventListener('click', handleClickFora);
            }
            return () => {
                document.removeEventListener('click', handleClickFora);
            };
        }, [buscaBarraAtivaMobile]);

        const handleNavClick = (navigationFn, e) => {
            e.preventDefault();
            if (navigationFn) navigationFn();
            setMenuAtivo(false); 
        };

        return (
            <header ref={headerElementRef}> 
                <button id="btn-menu" aria-label="Abrir menu" aria-expanded={menuAtivo} onClick={toggleMenu}>
                    ☰
                </button>
                <div className="logo-container">
                    <a href="#" onClick={(e) => handleNavClick(onNavigateHome, e)} aria-label="Página Inicial - Concessionária Nunes">
                        <img src="/images/logo/logo.png" alt="Logo Concessionária Nunes" id="header-logo" />
                    </a>
                </div>
                <div className="search-container" onClick={(e) => e.stopPropagation()}>
                    <input 
                        ref={searchBarRef}
                        type="search" 
                        id="header-search-bar" 
                        placeholder="Buscar veículo..." 
                        aria-label="Buscar veículo" 
                        value={termoBusca} 
                        onChange={handleSearchInputChange}
                        className={buscaBarraAtivaMobile ? 'ativo' : ''}
                    />
                    <button id="header-search-btn" aria-label="Buscar" onClick={handleSearchBtnClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </button>
                </div>
                <nav id="nav-menu" className={menuAtivo ? 'ativo' : ''}>
                    <ul>
                        <li><a href="#" onClick={(e) => handleNavClick(onNavigateHome, e)}>Home</a></li> 
                        <li><a href="#" onClick={(e) => handleNavClick(onNavigateInteresses, e)}>Meus Interesses</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setMenuAtivo(false);}}>Opção 2</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setMenuAtivo(false);}}>Opção 3</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setMenuAtivo(false);}}>Opção 4</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setMenuAtivo(false);}}>Opção 5</a></li>
                    </ul>
                </nav>
            </header>
        );
}

export default Header;