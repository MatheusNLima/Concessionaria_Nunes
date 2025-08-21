const express = require('express');
const fetch = require('node-fetch'); // Necessário para usar fetch no ambiente Node.js
const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware.js');

// URL do microserviço Python (lê da .env ou usa o padrão local)
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Rota para gerar descrição
router.post('/generate-description', protectRoute, async (req, res) => {
  try {
    const carData = req.body;
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/generate_description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro no serviço de IA: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Erro ao chamar serviço de IA (descrição):', error);
    res.status(500).json({ 
      error: 'Erro interno ao se comunicar com o serviço de IA.',
      details: error.message 
    });
  }
});

// Rota para chat
router.post('/chat', protectRoute, async (req, res) => {
  try {
    const { carro_id, user_message } = req.body;
    
    // ATENÇÃO: Carregar o JSON a cada requisição pode ser ineficiente.
    // Em produção, seria melhor carregar isso na memória na inicialização do servidor.
    const carros = require('../../../public/dados/carros.json');
    
    const chatData = {
      carro_id: parseInt(carro_id, 10),
      user_message,
      carros_contexto: carros
    };
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro no serviço de IA: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Erro ao chamar serviço de IA (chat):', error);
    res.status(500).json({ 
      error: 'Erro interno ao se comunicar com o serviço de IA.',
      details: error.message 
    });
  }
});

module.exports = router;