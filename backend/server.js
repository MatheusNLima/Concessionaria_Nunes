require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./routes/auth.routes.js');
const interestRoutes = require('./routes/interest.routes.js');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const allowedOrigins = [
    'http://localhost:5173',
    'https://matheusnlima.github.io'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido por CORS'));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(compression());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Muitas tentativas. Tente novamente mais tarde.' }
});
app.use('/api/users/login', loginLimiter);

app.use('/api/users', authRoutes);
app.use('/api/interesses', interestRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas com sucesso!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Falha ao conectar com MongoDB:', err);
    process.exit(1);
  });