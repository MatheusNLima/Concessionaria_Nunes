const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const getInterests = (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT car_id FROM user_interests WHERE user_id = ?`;
    
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Erro no controller (getInterests):", err);
            return res.status(500).json({ message: "Erro ao buscar interesses." });
        }
        const carIds = rows.map(row => row.car_id);
        res.json(carIds);
    });
};

const addInterest = (req, res) => {
    const userId = req.user.id;
    const carId = req.params.carroId;
    const sql = `INSERT OR IGNORE INTO user_interests (user_id, car_id) VALUES (?, ?)`;

    db.run(sql, [userId, carId], function(err) {
        if (err) {
            console.error("Erro no controller (addInterest):", err);
            return res.status(500).json({ message: "Erro ao adicionar interesse." });
        }
        res.status(201).json({ message: 'Interesse adicionado com sucesso.' });
    });
};

const removeInterest = (req, res) => {
    const userId = req.user.id;
    const carId = req.params.carroId;
    const sql = `DELETE FROM user_interests WHERE user_id = ? AND car_id = ?`;

    db.run(sql, [userId, carId], function(err) {
        if (err) {
            console.error("Erro no controller (removeInterest):", err);
            return res.status(500).json({ message: "Erro ao remover interesse." });
        }
        res.status(200).json({ message: 'Interesse removido com sucesso.' });
    });
};

module.exports = {
    getInterests,
    addInterest,
    removeInterest,
};