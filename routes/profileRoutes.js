const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, profileController.getProfile);
router.get('/edit', isAuthenticated, profileController.getEditProfile);

module.exports = router;
