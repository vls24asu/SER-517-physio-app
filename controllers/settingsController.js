const UserService = require('../services/UserService');
const UserProfileService = require('../services/UserProfileService');
const NotificationService = require('../services/NotificationService');

const userService = new UserService();
const profileService = new UserProfileService();
const notifService = new NotificationService();

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
    const { fullName, age, gender } = req.body;
    const userId = req.session.user.id;

    await profileService.updateNameEmail(userId, { fullName, email: req.session.user.email });
    await profileService.updatePersonalInfo(userId, { age: age || null, gender: gender || null });

    req.session.user.fullName = fullName;

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

    if (!/[A-Z]/.test(newPassword)) {
      req.flash('error', 'New password must contain at least one uppercase letter.');
      return res.redirect('/settings/password');
    }

    if (!/[a-z]/.test(newPassword)) {
      req.flash('error', 'New password must contain at least one lowercase letter.');
      return res.redirect('/settings/password');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      req.flash('error', 'New password must contain at least one special character.');
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
    const { pain_status, pain_intensity } = req.body;
    const rawAreas = req.body.pain_areas;
    const painAreas = Array.isArray(rawAreas) ? rawAreas.join(',') : (rawAreas || null);
    await profileService.updatePainAreas(req.session.user.id, {
      painAreas,
      painStatus: pain_status || null,
      painIntensity: pain_intensity !== undefined ? pain_intensity : null
    });
    req.flash('success', 'Pain management updated.');
    res.redirect('/settings/pain-management');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update pain management.');
    res.redirect('/settings/pain-management');
  }
};

// POST /settings/delete-account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await userService.deleteUser(userId);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete account. Please try again.');
    res.redirect('/settings');
  }
};

// GET /settings/notifications
const getNotifications = async (req, res) => {
  try {
    const prefs = await notifService.getPreferences(req.session.user.id);
    res.render('settings/notifications', { prefs });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/settings');
  }
};

// POST /settings/notifications
const postNotifications = async (req, res) => {
  try {
    const b = req.body;
    await notifService.savePreferences(req.session.user.id, {
      in_app_enabled:           b.in_app_enabled           === 'on',
      push_enabled:             b.push_enabled             === 'on',
      type_session_completed:   b.type_session_completed   === 'on',
      type_achievement_unlocked:b.type_achievement_unlocked=== 'on',
      type_streak_active:       b.type_streak_active       === 'on',
      type_streak_broken:       b.type_streak_broken       === 'on',
      type_progress_milestone:  b.type_progress_milestone  === 'on',
      type_pain_checkin:        b.type_pain_checkin        === 'on',
      type_workout_reminder:    b.type_workout_reminder    === 'on',
      reminder_time:            b.reminder_time            || '09:00',
      timezone:                 b.timezone                 || 'UTC',
    });
    req.flash('success', 'Notification preferences saved.');
    res.redirect('/settings/notifications');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to save preferences.');
    res.redirect('/settings/notifications');
  }
};

// POST /settings/notifications/clear-all
const clearAllNotifications = async (req, res) => {
  try {
    await notifService.deleteAll(req.session.user.id);
    req.flash('success', 'All notifications cleared.');
    res.redirect('/settings/notifications');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to clear notifications.');
    res.redirect('/settings/notifications');
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
  postPainManagement,
  deleteAccount,
  getNotifications,
  postNotifications,
  clearAllNotifications,
};
