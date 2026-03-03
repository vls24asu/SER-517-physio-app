const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

// Session status (used to prevent cached protected pages after logout)
router.get('/auth/session', authController.sessionStatus);

// Register
router.get('/register', authController.getRegister);
router.post('/register', validateRegistration, authController.postRegister);

// Login
router.get('/login', authController.getLogin);
router.post('/login', validateLogin, authController.postLogin);

// Logout
router.post('/logout', isAuthenticated, authController.logout);

// Onboarding Page

router.get('/onboarding', isAuthenticated, (req, res) => {
  res.render('onboarding', { layout: false });
});
// Complete Onboarding
router.post('/onboarding/complete', isAuthenticated, authController.completeOnboarding);

module.exports = router;
