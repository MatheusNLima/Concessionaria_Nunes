const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

const registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    try {
        if (await User.findOne({ email })) {
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password_hash });
        await newUser.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser._id });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar o usuário.', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        
        const payload = { user: { id: user._id, email: user.email } };
        
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
        res.json({ message: 'Login bem-sucedido!', token });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
    }
};

module.exports = { registerUser, loginUser };