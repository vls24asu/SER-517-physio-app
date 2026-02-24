const UserService = require('../services/UserService');
const UserProfileService = require('../services/UserProfileService');

const userService = new UserService();
const profileService = new UserProfileService();

// GET /settings
const getSettings = async (req, res) => {
  try {
    const user = await userService.getUserById(req.session.user.id);
    res.render('settings/index', { user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/profile');
  }
};

// GET /settings/personal-info
const getPersonalInfo = async (req, res) => {
  try {
    const user = await userService.getUserById(req.session.user.id);
    const profile = await profileService.getProfile(req.session.user.id);
    res.render('settings/personal-info', { user, profile });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/settings');
  }
};

// POST /settings/personal-info
const postPersonalInfo = async (req, res) => {
  try {
    const { fullName, email, age, gender } = req.body;
    const userId = req.session.user.id;

    await profileService.updateNameEmail(userId, { fullName, email });
    await profileService.updatePersonalInfo(userId, { age: age || null, gender: gender || null });

    req.session.user.fullName = fullName;
    req.session.user.email = email;

    req.flash('success', 'Personal information updated.');
    res.redirect('/settings/personal-info');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update personal information.');
    res.redirect('/settings/personal-info');
  }
};

// GET /settings/body-metrics
const getBodyMetrics = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.session.user.id);
    res.render('settings/body-metrics', { profile });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/settings');
  }
};

// POST /settings/body-metrics
const postBodyMetrics = async (req, res) => {
  try {
    const { heightCm, weightKg } = req.body;
    await profileService.updateBodyMetrics(req.session.user.id, {
      heightCm: heightCm || null,
      weightKg: weightKg || null
    });
    req.flash('success', 'Body metrics updated.');
    res.redirect('/settings/body-metrics');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update body metrics.');
    res.redirect('/settings/body-metrics');
  }
};

// GET /settings/password
const getPassword = async (req, res) => {
  try {
    const user = await userService.getUserById(req.session.user.id);
    res.render('settings/password', { user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/settings');
  }
};

// POST /settings/password
const postPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/settings/password');
    }

    if (newPassword.length < 8) {
      req.flash('error', 'New password must be at least 8 characters.');
      return res.redirect('/settings/password');
    }

    await profileService.changePassword(req.session.user.id, currentPassword, newPassword);
    req.flash('success', 'Password updated successfully.');
    res.redirect('/settings/password');
  } catch (err) {
    if (err.message === 'Current password is incorrect') {
      req.flash('error', 'Current password is incorrect.');
    } else {
      console.error(err);
      req.flash('error', 'Failed to update password.');
    }
    res.redirect('/settings/password');
  }
};

// GET /settings/goals
const getGoals = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.session.user.id);
    res.render('settings/goals', { profile });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/settings');
  }
};

// POST /settings/goals
const postGoals = async (req, res) => {
  try {
    const { fitnessLevel, exercisePreference, workoutDurationMin, goals } = req.body;
    await profileService.updateGoalsAndPreferences(req.session.user.id, {
      fitnessLevel,
      exercisePreference,
      workoutDurationMin: workoutDurationMin || 30,
      goals: goals || null
    });
    req.flash('success', 'Goals & preferences updated.');
    res.redirect('/settings/goals');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update goals.');
    res.redirect('/settings/goals');
  }
};

// GET /settings/pain-management
const getPainManagement = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.session.user.id);
    res.render('settings/pain-management', { profile });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/settings');
  }
};

// POST /settings/pain-management
const postPainManagement = async (req, res) => {
  try {
    const { painAreas } = req.body;
    await profileService.updatePainAreas(req.session.user.id, { painAreas: painAreas || null });
    req.flash('success', 'Pain areas updated.');
    res.redirect('/settings/pain-management');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update pain areas.');
    res.redirect('/settings/pain-management');
  }
};

module.exports = {
  getSettings,
  getPersonalInfo,
  postPersonalInfo,
  getBodyMetrics,
  postBodyMetrics,
  getPassword,
  postPassword,
  getGoals,
  postGoals,
  getPainManagement,
  postPainManagement
};
