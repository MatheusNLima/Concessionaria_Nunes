import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem('userToken'));
    const [interestIds, setInterestIds] = useState([]);
    const navigate = useNavigate();

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
            setInterestIds([]);
        }
    };

    useEffect(() => {
        fetchInteresses();
    }, [token]);
    
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(sessionStorage.getItem('userToken'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (newToken) => {
        sessionStorage.setItem('userToken', newToken);
        setToken(newToken);
        navigate('/');
    };

    const logout = () => {
        sessionStorage.removeItem('userToken');
        setToken(null);
        setInterestIds([]);
        navigate('/login');
    };

    const toggleInterest = async (carId) => {
        if (!token) return;
        
        const isCurrentlyFavorited = interestIds.includes(carId);
        const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
        const url = `https://concessionaria-nunes.onrender.com/api/interesses/${carId}`;
        
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
                console.error("Falha ao atualizar interesse na API.");
                fetchInteresses();
            }
        } catch (error) {
            console.error("Erro de rede ao atualizar interesse.", error);
            fetchInteresses();
        }
    };

    const value = { 
        isLoggedIn: !!token, 
        token, 
        login, 
        logout,
        interestIds,
        toggleInterest
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