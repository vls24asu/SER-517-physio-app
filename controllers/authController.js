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

const getLogin = (_req, res) => {
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
  req.flash('success', 'You have been logged out successfully.');
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

module.exports = { getRegister, postRegister, getLogin, postLogin, logout };
