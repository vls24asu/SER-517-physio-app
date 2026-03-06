const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getProgress } = require('../controllers/progressController');

router.get('/', isAuthenticated, getProgress);

module.exports = router;
