const express = require('express');
// Ajuste para garantir que `fetch` seja a função esperada
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // MUDANÇA AQUI
// O método acima garante que, mesmo em CommonJS, o default export de 'node-fetch' seja pego.
// Se seu Node.js suporta fetch nativo (versões mais recentes), pode usar direto.

// Antigo: const fetch = require('node-fetch'); // Esta linha deu problema

const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware.js');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL; 

if (!PYTHON_SERVICE_URL) {
  console.error("ERRO CRÍTICO: PYTHON_SERVICE_URL NÃO ESTÁ DEFINIDA. Verifique o arquivo .env da pasta 'backend'.");
} else {
    console.log(`AI Routes (Node.js) using Python Service at: ${PYTHON_SERVICE_URL}`);
}

// Rota para gerar descrição
router.post('/generate-description', protectRoute, async (req, res) => {
  try {
    const carData = req.body;
    console.log('Node.js Backend: Recebeu solicitação para gerar descrição.', carData.nome);
    console.log(`Node.js Backend: Chamando serviço Python em ${PYTHON_SERVICE_URL}/generate_description`);
    
    // TypeError: fetch is not a function aconteceu AQUI
    const response = await fetch(`${PYTHON_SERVICE_URL}/generate_description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Node.js Backend: Erro do serviço Python (descrição):', errorData);
      throw new Error(`Erro no serviço de IA: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Node.js Backend: Resposta recebida da IA (descrição).');
    res.json(data);
    
  } catch (error) {
    console.error('Node.js Backend: Erro ao comunicar com serviço de IA (descrição):', error);
    res.status(500).json({ 
      error: 'Erro interno ao se comunicar com o serviço de IA.',
      details: error.message 
    });
  }
});

// Rota para chat
router.post('/chat', protectRoute, async (req, res) => {
  try {
    const { carro_id, user_message, carros_contexto } = req.body; 

    console.log('Node.js Backend: Recebeu solicitação de chat.');
    console.log(`Node.js Backend: Chamando serviço Python em ${PYTHON_SERVICE_URL}/chat para carro ID ${carro_id}`);

    const chatData = {
      carro_id: parseInt(carro_id, 10),
      user_message,
      carros_contexto: carros_contexto || [] 
    };
    
    // TypeError: fetch is not a function aconteceu AQUI também
    const response = await fetch(`${PYTHON_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Node.js Backend: Erro do serviço Python (chat):', errorData);
        throw new Error(`Erro no serviço de IA: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Node.js Backend: Resposta recebida da IA (chat).');
    res.json(data);
    
  } catch (error) {
    console.error('Node.js Backend: Erro ao comunicar com serviço de IA (chat):', error);
    res.status(500).json({ 
      error: 'Erro interno ao se comunicar com o serviço de IA.',
      details: error.message 
    });
  }
});

module.exports = router;