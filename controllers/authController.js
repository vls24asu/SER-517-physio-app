const UserService = require('../services/UserService');
const { validationResult } = require('express-validator');

const userService = new UserService();

/* =========================
   REGISTER
========================= */

const getRegister = (req, res) => {
  res.render('auth/register', { errors: [] });
};

const postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', { errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

  try {
    const emailTaken = await userService.isEmailTaken(email);
    if (emailTaken) {
      return res.render('auth/register', {
        errors: [{ msg: 'Email is already registered' }]
      });
    }

    const newUser = await userService.register(fullName, email, password);

    // Auto-login after register
    req.session.user = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role
    };

    return res.redirect('/onboarding');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/register');
  }
};

/* =========================
   LOGIN
========================= */

const getLogin = (req, res) => {
  if (req.query.loggedOut === '1') {
    req.flash('success', 'You have been logged out successfully.');
  }
  res.render('auth/login', { errors: [] });
};

const postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', { errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await userService.authenticate(email, password);
    if (!user) {
      return res.render('auth/login', {
        errors: [{ msg: 'Invalid email or password' }]
      });
    }

    if (user.twofaEnabled) {
      req.session.temp_twofa_user = { id: user.id };
      return res.redirect('/twofa/verify');
    }

    req.session.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    // Force onboarding if not completed
    if (!user.onboarding_completed) {
      return res.redirect('/onboarding');
    }

    return res.redirect('/dashboard');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/login');
  }
};

/* =========================
   LOGOUT
========================= */

const logout = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }

    res.clearCookie('connect.sid');
    res.redirect('/login?loggedOut=1');
  });
};

/* =========================
   SESSION STATUS
========================= */

const sessionStatus = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.session.user && req.session.user.id) {
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false });
};

/* =========================
   ONBOARDING COMPLETE
========================= */

const completeOnboarding = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    await userService.markOnboardingComplete(req.session.user.id);
    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not complete onboarding.');
    return res.redirect('/onboarding');
  }
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  sessionStatus,
  completeOnboarding
};