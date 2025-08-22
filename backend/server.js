require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const authRoutes = require('./routes/auth.routes.js');
const interestRoutes = require('./routes/interest.routes.js');
const iaRoutes = require('./routes/ia.routes.js');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

let allowedOrigins = [];
if (isProduction) {
  allowedOrigins = [
    'https://matheusnlima.github.io',
    'https://concessionaria-nunes.onrender.com'
  ];
} else if (isDevelopment) {
  allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8000'
  ];
} else {
  allowedOrigins = ['*'];
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('Origem bloqueada por CORS:', origin);
      callback(new Error('Acesso não permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(compression());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    message: 'Muitas tentativas de login. Tente novamente mais tarde.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/users/login', loginLimiter);

app.use('/api/users', authRoutes);
app.use('/api/interesses', interestRoutes);
app.use('/api/ia', iaRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor da Concessionária Nunes está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'desenvolvimento'
  });
});

app.get('/api/carros', (req, res) => {
  try {
  
    const carrosPath = path.join(__dirname, '../public/dados/carros.json'); 
    if (fs.existsSync(carrosPath)) {
      const carrosData = fs.readFileSync(carrosPath, 'utf8');
      const carros = JSON.parse(carrosData);
      res.json(carros);
    } else {
      res.status(404).json({ message: 'Arquivo de carros não encontrado no backend' });
    }
  } catch (error) {
    console.error('Erro ao carregar carros:', error);
    res.status(500).json({ message: 'Erro interno ao carregar dados dos carros' });
  }
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  
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
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: 'Dados duplicados', 
      details: `${field} já está em uso` 
    });
  }

  res.status(500).json({ 
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas com sucesso!');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
      console.log(`🌐 URLs permitidas: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch(err => {
    console.error('Falha ao conectar com MongoDB:', err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  console.log('\n🛑 Recebido sinal de interrupção (SIGINT)');
  mongoose.connection.close(() => {
    console.log('✅ Conexão com MongoDB fechada');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido sinal de término (SIGTERM)');
  mongoose.connection.close(() => {
    console.log('✅ Conexão com MongoDB fechada');
    process.exit(0);
  });
});

module.exports = app;