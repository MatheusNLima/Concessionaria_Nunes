const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // Fix de importação de fetch
const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware.js');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL; 

if (!PYTHON_SERVICE_URL) {
  console.error("ERRO CRÍTICO: PYTHON_SERVICE_URL NÃO ESTÁ DEFINIDA para o Backend Node.js. Verifique o .env ou as vars de ambiente do Render.");
  // Em produção, você pode querer interromper a inicialização do backend aqui
  // process.exit(1); 
} else {
    console.log(`Node.js Backend: Rotas de IA configuradas para usar Serviço Python em: ${PYTHON_SERVICE_URL}`);
}

// Rota para gerar descrição
router.post('/generate-description', protectRoute, async (req, res) => {
  try {
    const carData = req.body;
    console.log('Node.js Backend: Recebeu solicitação para gerar descrição de:', carData.nome);
    console.log(`Node.js Backend: Chamando serviço Python em ${PYTHON_SERVICE_URL}/generate_description`);
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/generate_description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Node.js Backend: Erro do serviço Python (generate-description):', errorData);
      throw new Error(`Erro no serviço de IA: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Node.js Backend: Resposta recebida da IA (descrição).');
    res.json(data);
    
  } catch (error) {
    console.error('Node.js Backend: Erro ao comunicar com serviço de IA (generate-description):', error);
    res.status(500).json({ 
      message: 'Erro interno ao se comunicar com o serviço de IA para geração de descrição.',
      details: error.message 
    });
  }
});

// Rota para chat
router.post('/chat', protectRoute, async (req, res) => {
  try {
    // AGORA O SERVIÇO PYTHON BUSCARÁ OS CARROS SOZINHO NA SUA INICIALIZAÇÃO.
    // ENTÃO, NÃO É MAIS NECESSÁRIO RECEBER 'carros_contexto' DO FRONTEND AQUI.
    const { carro_id, user_message } = req.body; 

    console.log('Node.js Backend: Recebeu solicitação de chat.');
    console.log(`Node.js Backend: Chamando serviço Python em ${PYTHON_SERVICE_URL}/chat para carro ID ${carro_id}`);

    // Cria os dados para enviar para o serviço Python (APENAS o necessário para identificar o carro e a mensagem)
    const chatData = {
      carro_id: parseInt(carro_id, 10),
      user_message
    };
    
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
      message: 'Erro interno ao se comunicar com o serviço de IA para chat.',
      details: error.message 
    });
  }
});

module.exports = router;