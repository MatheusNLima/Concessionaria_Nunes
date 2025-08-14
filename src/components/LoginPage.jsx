
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  document.title = "Login - Concessionária Nunes";


  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
        const response = await fetch('https://concessionaria-nunes.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login.');
      }

      localStorage.setItem('userToken', data.token);

      setMessage('Login bem-sucedido! Redirecionando...');
  setTimeout(() => navigate('/'), 2000);

    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Entrar</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Entrar</button>
        {message && <p className="auth-message">{message}</p>}
      </form>
    </div>
  );
}

export default LoginPage;