const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.js'); 

const router = express.Router();

const JWT_SECRET = 'seu-segredo-super-secreto-mude-depois';

router.post('/register', async (req, res) => {
    // Implemente a lógica de registro aqui
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error("Erro no banco de dados:", err.message);
            return res.status(500).json({ message: 'Erro ao fazer login.' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const payload = { 
            user: {
                id: user.id,
                email: user.email
            } 
        };
        
        jwt.sign(
            payload, 
            JWT_SECRET, 
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Login bem-sucedido!',
                    token: token
                });
            }
        );
    });
});


module.exports = router;