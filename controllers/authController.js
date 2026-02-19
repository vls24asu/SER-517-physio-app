const UserService = require('../services/UserService');
const { validationResult } = require('express-validator');

const userService = new UserService();

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

    await userService.register(fullName, email, password);
    req.flash('success', 'Account created successfully. Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/register');
  }
};

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
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/login');
  }
};

const logout = (req, res) => {
  // Set no-cache headers before destroying session
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    // Use query param since flash is lost with session destroy
    res.redirect('/login?loggedOut=1');
  });
};

const sessionStatus = (req, res) => {
  // Explicitly prevent caching of this check.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.session.user && req.session.user.id) {
    return res.status(200).json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
};

module.exports = { getRegister, postRegister, getLogin, postLogin, logout, sessionStatus };
