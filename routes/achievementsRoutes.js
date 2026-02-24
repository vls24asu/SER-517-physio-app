const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getAchievements } = require('../controllers/achievementsController');

router.get('/', isAuthenticated, getAchievements);

module.exports = router;
