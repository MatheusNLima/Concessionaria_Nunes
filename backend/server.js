require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes.js');
const interestRoutes = require('./routes/interest.routes.js');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

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