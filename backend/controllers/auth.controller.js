const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database.js');

const JWT_SECRET = 'seu-segredo-super-secreto-mude-depois';

const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (email, password_hash) VALUES (?, ?)`;

        db.run(sql, [email, passwordHash], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                     return res.status(409).json({ message: 'Este email já está cadastrado.' });
                }
                console.error("Erro no banco de dados:", err.message);
                return res.status(500).json({ message: 'Erro ao registrar o usuário.' });
            }
            res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: this.lastID });
        });
    } catch (error) {
        console.error("Erro no servidor:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        
        const payload = { user: { id: user.id, email: user.email } };
        
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error("Erro ao gerar token:", err);
                return res.status(500).json({ message: "Erro ao fazer login" });
            }
            res.json({ message: 'Login bem-sucedido!', token: token });
        });
    });
};

module.exports = {
    registerUser,
    loginUser,
};
module.exports = {
    registerUser,
    loginUser,
};