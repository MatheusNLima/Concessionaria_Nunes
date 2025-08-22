import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  document.title = "Cadastro - Concessionária Nunes";


  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
     // URL ajustada para relativa
     const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao registrar.');
      }

      setMessage('Registro bem-sucedido! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Criar Conta</h2>
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
        <button type="submit" className="auth-button">Registrar</button>
        {message && <p className="auth-message">{message}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;