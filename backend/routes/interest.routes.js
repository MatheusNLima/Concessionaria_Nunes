const express = require('express');
const router = express.Router();
const { getInterests, addInterest, removeInterest } = require('../controllers/interest.controller');
const { protectRoute } = require('../middleware/auth.middleware.js');

router.get('/', protectRoute, getInterests);
router.post('/:carroId', protectRoute, addInterest);
router.delete('/:carroId', protectRoute, removeInterest);

module.exports = router;