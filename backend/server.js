require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// PYTHON_SERVICE_URL será fornecida pelas variáveis de ambiente do Render no serviço Node.js.
// O fallback http://localhost:8000 é para desenvolvimento local.
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Importar rotas
const authRoutes = require('./routes/auth.routes.js');
const interestRoutes = require('./routes/interest.routes.js');
const iaRoutes = require('./routes/ia.routes.js');

const app = express();
const PORT = process.env.PORT || 3001; // Render irá injetar sua própria PORT em produção
const MONGO_URI = process.env.MONGO_URI; // Devar ser definida nas vars de ambiente do Render
const JWT_SECRET = process.env.JWT_SECRET; // Será lida aqui, do .env local ou vars do Render

// Configuração do CORS baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Definir origens permitidas
let allowedOrigins = [];
if (isProduction) {
  // URLs PÚBLICAS do seu Frontend no Render e/ou GitHub Pages.
  // CERTIFIQUE-SE DE ATUALIZAR 'concessionaria-nunes-frontend.onrender.com' COM A URL REAL DO SEU FRONTEND RENDER
  allowedOrigins = [
    'https://matheusnlima.github.io', 
    'https://concessionaria-nunes-frontend.onrender.com' // << SUA URL REAL DO FRONTEND NO RENDER AQUI
  ];
} else if (isDevelopment) {
  allowedOrigins = [
    'http://localhost:5173', // Frontend local (Vite)
    'http://localhost:3000', // Frontend alternativo local
    'http://localhost:8000'  // Serviço Python local (para testes CORS, embora incomum diretamente)
  ];
} else {
  allowedOrigins = ['*']; // Para outros ambientes (como teste), permitir todas as origens
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Permitir requisições sem origem (mobile apps, curl)
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log(`Origem bloqueada por CORS: ${origin}. Permitidas: ${allowedOrigins.join(', ')}`);
      callback(new Error('Acesso não permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limite do tamanho do corpo da requisição
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet()); // Segurança HTTP
app.use(compression()); // Compactação de respostas HTTP

// Logging de requisições personalizadas
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// Rate limiting para o endpoint de login para proteger contra ataques de força bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas por IP dentro da janela
  message: { 
    message: 'Muitas tentativas de login. Tente novamente mais tarde.' 
  },
  standardHeaders: true, // Adiciona headers de RateLimit (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`)
  legacyHeaders: false, // Desabilita os headers X-RateLimit-*
});
app.use('/api/users/login', loginLimiter);

// Rotas da API
app.use('/api/users', authRoutes);
app.use('/api/interesses', interestRoutes);
app.use('/api/ia', iaRoutes);

// Rota de saúde para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor da Concessionária Nunes está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'desenvolvimento',
    ai_service_url_configured: PYTHON_SERVICE_URL // Para depuração, verificar se a URL da IA está definida
  });
});

// Rota para servir o arquivo de carros JSON
app.get('/api/carros', (req, res) => {
  try {
    // Caminho para o carros.json. '__dirname' é 'backend/', '../' sobe para a raiz,
    // depois entra em 'public/dados'. Este path está CORRETO para a sua estrutura atual.
    const carrosPath = path.join(__dirname, '../public/dados/carros.json');

    // Logging adicional para depuração de arquivos no Render
    console.log(`Node.js Backend: Tentando carregar carros de: ${carrosPath}`);

    if (fs.existsSync(carrosPath)) {
      const carrosData = fs.readFileSync(carrosPath, 'utf8');
      const carros = JSON.parse(carrosData);
      console.log(`Node.js Backend: Carregados ${carros.length} carros com sucesso.`);
      res.json(carros);
    } else {
      console.error(`Node.js Backend: Erro 404: Arquivo de carros NÃO ENCONTRADO em ${carrosPath}`);
      res.status(404).json({ message: `Arquivo de carros não encontrado no backend (${carrosPath}).` });
    }
  } catch (error) {
    console.error(`Node.js Backend: Erro ao carregar dados dos carros de ${carrosPath}:`, error);
    res.status(500).json({ message: 'Erro interno ao carregar dados dos carros', details: error.message });
  }
});

// Middleware para tratamento de erros CENTRALIZADO
app.use((err, req, res, next) => {
  console.error('Node.js Backend: Erro não tratado:', err.stack);
  
  if (err.message === 'Acesso não permitido por CORS') {
    return res.status(403).json({ 
      message: 'Acesso não permitido',
      details: 'Origem não autorizada para esta requisição'
    });
  }
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      message: 'Dados inválidos', 
      errors 
    });
  }
  
  if (err.code === 11000) { // Erro de duplicidade no MongoDB
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: 'Dados duplicados', 
      details: `${field} já está em uso` 
    });
  }

  // Erro padrão do servidor
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    // Em produção, evite expor o stack trace para o cliente
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
  });
});

// Rota de fallback para qualquer outra requisição não tratada
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Conexão com MongoDB e inicialização do servidor
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Node.js Backend: Conectado ao MongoDB Atlas com sucesso!');
    
    app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' para ser acessível externamente em ambiente de container
      console.log(`🚀 Node.js Backend: Servidor rodando na porta ${PORT}`);
      console.log(`📊 Node.js Backend: Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
      console.log(`🌐 Node.js Backend: URLs permitidas para CORS: ${allowedOrigins.join(', ')}`);
      console.log(`🐍 Node.js Backend: AI Service Python URL: ${PYTHON_SERVICE_URL}`);
      if (!MONGO_URI) console.error("AVISO: MONGO_URI NÃO ESTÁ DEFINIDA. Verifique suas variáveis de ambiente.");
      if (!JWT_SECRET) console.error("AVISO: JWT_SECRET NÃO ESTÁ DEFINIDA. Verifique suas variáveis de ambiente.");
      if (!PYTHON_SERVICE_URL) console.error("AVISO: PYTHON_SERVICE_URL NÃO ESTÁ DEFINIDA. AI Service pode falhar.");
    });
  })
  .catch(err => {
    console.error('Node.js Backend: FALHA ao conectar com MongoDB:', err);
    process.exit(1); // Encerra o processo se a conexão com o DB falhar
  });

// Implementação de "Graceful Shutdown" para fechar o DB antes de encerrar o processo
process.on('SIGINT', () => {
  console.log('\n🛑 Node.js Backend: Recebido sinal de interrupção (SIGINT). Fechando conexão com MongoDB...');
  mongoose.connection.close(() => {
    console.log('✅ Node.js Backend: Conexão com MongoDB fechada.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Node.js Backend: Recebido sinal de término (SIGTERM). Fechando conexão com MongoDB...');
  mongoose.connection.close(() => {
    console.log('✅ Node.js Backend: Conexão com MongoDB fechada.');
    process.exit(0);
  });
});

module.exports = app;