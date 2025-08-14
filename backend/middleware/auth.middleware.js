const jwt = require('jsonwebtoken');

const JWT_SECRET = 'seu-segredo-super-secreto-mude-depois';

const protectRoute = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token mal formatado.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = decoded.user;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Acesso negado. Token inválido.' });
    }
};

module.exports = {
    protectRoute
};