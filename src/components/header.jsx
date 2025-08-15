import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Header({ termoBusca, onBuscaChange, onNavigateHome, onNavigateInteresses }) {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const [menuAtivo, setMenuAtivo] = React.useState(false);
    const [buscaBarraAtivaMobile, setBuscaBarraAtivaMobile] = React.useState(false);
    const headerElementRef = React.useRef(null);
    const searchBarRef = React.useRef(null);

    React.useEffect(() => {
        headerElementRef.current = document.querySelector('header');
    }, []);

    const toggleMenu = (event) => {
        event.stopPropagation();
        setMenuAtivo(prev => !prev);
        if (buscaBarraAtivaMobile) {
            setBuscaBarraAtivaMobile(false);
            if (headerElementRef.current) headerElementRef.current.classList.remove('search-active');
        }
    };

    const handleSearchInputChange = (event) => {
        if (onBuscaChange) onBuscaChange(event.target.value);
    };

    const handleSearchBtnClick = (event) => {
        event.stopPropagation();
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const novaBuscaAtiva = !buscaBarraAtivaMobile;
            setBuscaBarraAtivaMobile(novaBuscaAtiva);
            if (headerElementRef.current) headerElementRef.current.classList.toggle('search-active', novaBuscaAtiva);
            if (novaBuscaAtiva && searchBarRef.current) searchBarRef.current.focus();
            if (menuAtivo) setMenuAtivo(false);
        } else {
            if (searchBarRef.current) searchBarRef.current.focus();
            if (onBuscaChange && searchBarRef.current) onBuscaChange(searchBarRef.current.value);
        }
    };
    
    React.useEffect(() => {
        const handleClickFora = (event) => {
            const searchContainerNode = headerElementRef.current?.querySelector('.search-container');
            if (buscaBarraAtivaMobile && searchContainerNode && !searchContainerNode.contains(event.target)) {
                const searchBtnNode = document.getElementById('header-search-btn');
                if (!searchBtnNode?.contains(event.target)) { 
                    setBuscaBarraAtivaMobile(false);
                    if(headerElementRef.current) headerElementRef.current.classList.remove('search-active');
                }
            }
        };
        if (buscaBarraAtivaMobile) document.addEventListener('click', handleClickFora);
        return () => document.removeEventListener('click', handleClickFora);
    }, [buscaBarraAtivaMobile]);

    const handleNavClick = (navigationFn, e) => {
        e.preventDefault();
        if (navigationFn) navigationFn();
        setMenuAtivo(false); 
    };
    
    const logoSrc = `${import.meta.env.BASE_URL}images/logo/logo.png`;

    return (
        <header ref={headerElementRef}>
            <button id="btn-menu" aria-label="Abrir menu" aria-expanded={menuAtivo} onClick={toggleMenu}>☰</button>
            
            <div className="logo-container">
                <a href="#" onClick={(e) => handleNavClick(onNavigateHome, e)} aria-label="Página Inicial">
                    <img src={logoSrc} alt="Logo Concessionária Nunes" id="header-logo" />
                </a>
            </div>

            <div className="header-actions-right">
                <div className="search-container" onClick={(e) => e.stopPropagation()}>
                    <input ref={searchBarRef} type="search" id="header-search-bar" placeholder="Buscar..." value={termoBusca} onChange={handleSearchInputChange} className={buscaBarraAtivaMobile ? 'ativo' : ''} />
                    <button id="header-search-btn" aria-label="Buscar" onClick={handleSearchBtnClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                    </button>
                </div>
                <div className="auth-actions">
                    {isLoggedIn ? (
                        <button onClick={logout} className="btn-logout">Sair</button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="btn-login">Entrar</button>
                    )}
                </div>
            </div>
            
            <nav id="nav-menu" className={menuAtivo ? 'ativo' : ''}>
                <ul>
                    <li><a href="#" onClick={(e) => handleNavClick(onNavigateHome, e)}>Vitrine</a></li>
                    {isLoggedIn && (
                        <li><a href="#" onClick={(e) => handleNavClick(onNavigateInteresses, e)}>Meus Interesses</a></li>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;