const User = require('../models/user.model.js');

const getInterests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('interests');
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
        res.json(user.interests);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar interesses." });
    }
};

const addInterest = async (req, res) => {
    try {
        const carId = parseInt(req.params.carroId, 10);
        await User.updateOne({ _id: req.user.id }, { $addToSet: { interests: carId } });
        res.status(200).json({ message: 'Interesse adicionado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: "Erro ao adicionar interesse." });
    }
};

const removeInterest = async (req, res) => {
    try {
        const carId = parseInt(req.params.carroId, 10);
        await User.updateOne({ _id: req.user.id }, { $pull: { interests: carId } });
        res.status(200).json({ message: 'Interesse removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover interesse." });
    }
};

module.exports = { getInterests, addInterest, removeInterest };