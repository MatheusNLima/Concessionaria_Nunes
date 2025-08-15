import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [interestIds, setInterestIds] = useState([]);
    const navigate = useNavigate();

    // Busca os interesses iniciais ou sempre que o token mudar.
    const fetchInteresses = async () => {
        if (!token) {
            setInterestIds([]);
            return;
        }
        try {
            const response = await fetch('https://concessionaria-nunes.onrender.com/api/interesses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar interesses.');
            const ids = await response.json();
            setInterestIds(ids);
        } catch (error) {
            console.error(error);
            setInterestIds([]); // Limpa em caso de erro (ex: token expirado)
        }
    };

    // Efeito para buscar interesses na inicialização e no login/logout
    useEffect(() => {
        fetchInteresses();
    }, [token]);
    
    // Efeito para manter o estado sincronizado entre abas
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('userToken'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (newToken) => {
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setInterestIds([]);
        navigate('/login');
    };

    const toggleInterest = async (carId) => {
        if (!token) return;
        
        const isCurrentlyFavorited = interestIds.includes(carId);
        const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
        const url = `https://concessionaria-nunes.onrender.com/api/interesses/${carId}`;
        
        // Atualização otimista da UI para resposta imediata
        if (isCurrentlyFavorited) {
            setInterestIds(prev => prev.filter(id => id !== carId));
        } else {
            setInterestIds(prev => [...prev, carId]);
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                // Se a API falhar, reverte o estado
                console.error("Falha ao atualizar interesse na API.");
                fetchInteresses(); // Sincroniza com a verdade do servidor
            }
        } catch (error) {
            console.error("Erro de rede ao atualizar interesse.", error);
            fetchInteresses(); // Sincroniza com a verdade do servidor
        }
    };

    const value = { 
        isLoggedIn: !!token, 
        token, 
        login, 
        logout,
        interestIds,
        toggleInterest // Ação única para adicionar/remover
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};