const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

// Register
router.get('/register', authController.getRegister);
router.post('/register', validateRegistration, authController.postRegister);

// Login
router.get('/login', authController.getLogin);
router.post('/login', validateLogin, authController.postLogin);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
