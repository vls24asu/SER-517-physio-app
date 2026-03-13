const UserService = require('../services/UserService');
const UserProfileService = require('../services/UserProfileService');
const { validationResult } = require('express-validator');

const userService = new UserService();
const profileService = new UserProfileService();

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

    // New users created after onboarding launch have onboarding_completed = 0 (false).
    // Older existing users may have null here and should go straight to dashboard.
    if (user.onboarding_completed === 0) {
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

const VALID_PAIN_AREAS = ['neck', 'back', 'shoulders', 'knees'];

const GENDER_MAP = {
  male: 'male',
  female: 'female',
  nonbinary: 'non-binary',
  other: 'prefer_not_to_say',
  '': 'prefer_not_to_say'
};

const completeOnboarding = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const userId = req.session.user.id;
    const body = req.body;

    // Body metrics — convert to cm/kg
    const heightVal = parseFloat(body.height) || null;
    const weightVal = parseFloat(body.weight) || null;
    const heightCm = heightVal
      ? (body.height_unit === 'in' ? parseFloat((heightVal * 2.54).toFixed(1)) : heightVal)
      : null;
    const weightKg = weightVal
      ? (body.weight_unit === 'lb' ? parseFloat((weightVal / 2.2046).toFixed(1)) : weightVal)
      : null;

    // Gender
    const gender = GENDER_MAP[body.gender] || 'prefer_not_to_say';

    // Goals & preferences
    const fitnessLevel = ['beginner', 'intermediate', 'advanced'].includes(body.activity_level)
      ? body.activity_level : 'beginner';
    const workoutDurationMin = body.session_duration ? parseInt(body.session_duration) : 30;
    const goals = body.primary_goal || null;

    // Equipment — single or multi-select
    const rawEquipment = body['equipment[]'] || body.equipment;
    const availableEquipment = Array.isArray(rawEquipment)
      ? rawEquipment.join(',')
      : (rawEquipment || null);

    // Pain areas — whitelist validated
    const rawAreas = body['pain_areas[]'] || body.pain_areas;
    const areasArray = Array.isArray(rawAreas) ? rawAreas : (rawAreas ? [rawAreas] : []);
    const painAreas = areasArray.filter(a => VALID_PAIN_AREAS.includes(a)).join(',') || null;

    // Pain status & intensity
    const painStatus = body.pain_status === 'yes' || body.pain_status === 'no'
      ? body.pain_status : null;
    const painIntensity = body.pain_intensity !== undefined ? parseInt(body.pain_intensity) : null;

    await profileService.updateBodyMetrics(userId, { heightCm, weightKg });
    await profileService.updatePersonalInfo(userId, { age: null, gender });
    await profileService.updateGoalsAndPreferences(userId, {
      fitnessLevel,
      exercisePreference: 'both',
      workoutDurationMin,
      goals,
      availableEquipment
    });
    await profileService.updatePainAreas(userId, { painAreas, painStatus, painIntensity });

    await userService.markOnboardingComplete(userId);
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