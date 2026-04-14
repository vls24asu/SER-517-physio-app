const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../config/passport');
const { validateRegistration, validateLogin } = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

const googleOAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
);

// Session status (used to prevent cached protected pages after logout)
router.get('/auth/session', authController.sessionStatus);

// Register
router.get('/register', authController.getRegister);
router.post('/register', validateRegistration, authController.postRegister);

// Login
router.get('/login', authController.getLogin);
router.post('/login', validateLogin, authController.postLogin);

router.get('/auth/google', (req, res, next) => {
  if (!googleOAuthEnabled) {
    req.flash('error', 'Google sign-in is not configured yet.');
    return res.redirect('/login');
  }

  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/auth/google/callback', (req, res, next) => {
  if (!googleOAuthEnabled) {
    return res.redirect('/login');
  }

  return passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Google sign-in failed. Check your Google OAuth setup and try again.');
      return res.redirect('/login');
    }

    if (!user) {
      req.flash('error', 'Google sign-in was not completed.');
      return res.redirect('/login');
    }

    const finishLogin = () => {
      req.session.user = {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role || 'patient'
      };

      if (user.role === 'physio') {
        return res.redirect('/physio/dashboard');
      }

      if (!user.onboarding_completed) {
        return res.redirect('/onboarding');
      }

      // Route returning users through daily check-in if they haven't done it today
      const today = new Date().toISOString().split('T')[0];
      if (user.last_checkin_date !== today) {
        return res.redirect('/checkin');
      }

      return res.redirect('/dashboard');
    };

    if (typeof req.logout === 'function') {
      return req.logout(logoutErr => {
        if (logoutErr) {
          console.error(logoutErr);
          req.flash('error', 'Google sign-in failed. Please try again.');
          return res.redirect('/login');
        }

        return finishLogin();
      });
    }

    return finishLogin();
  })(req, res, next);
});

// Logout
router.post('/logout', isAuthenticated, authController.logout);

// Onboarding Page

router.get('/onboarding', isAuthenticated, async (req, res) => {
  const db = require('../config/db');
  const [[bodyPartRows], [injuryRows]] = await Promise.all([
    db.query(`SELECT name FROM Focus_Area_Option ORDER BY sort_order ASC`),
    db.query(`SELECT name FROM Injury_Reference ORDER BY name ASC`)
  ]);
  res.render('onboarding/index', {
    bodyParts: bodyPartRows.map(r => r.name),
    injuries: injuryRows.map(r => r.name)
  });
});
// Complete Onboarding
router.post('/onboarding/complete', isAuthenticated, authController.completeOnboarding);

module.exports = router;
