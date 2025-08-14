const express = require('express');
const cors = require('cors');
require('./database.js');

const authRoutes = require('./routes/auth.routes.js');
const interestRoutes = require('./routes/interest.routes.js');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', authRoutes);
app.use('/api/interesses', interestRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});