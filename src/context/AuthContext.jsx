// ...existing code...
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const navigate = useNavigate();

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
    navigate('/login');
    };

    const value = { isLoggedIn: !!token, token, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};