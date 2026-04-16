const UserService = require('../services/UserService');
const UserProfileService = require('../services/UserProfileService');
const NotificationService = require('../services/NotificationService');
const db = require('../config/db');

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
    const db = require('../config/db');
    const [profile, [bodyPartRows], [injuryRows]] = await Promise.all([
      profileService.getProfile(req.session.user.id),
      db.query(`SELECT name FROM Focus_Area_Option ORDER BY sort_order ASC`),
      db.query(`SELECT name FROM Injury_Reference ORDER BY name ASC`)
    ]);
    let painIntensityMap = {};
    if (profile && profile.pain_intensity_map) {
      try {
        painIntensityMap = typeof profile.pain_intensity_map === 'string'
          ? JSON.parse(profile.pain_intensity_map)
          : profile.pain_intensity_map;
      } catch (e) { painIntensityMap = {}; }
    }
    res.render('settings/pain-management', {
      profile,
      bodyParts: bodyPartRows.map(r => r.name),
      injuries: injuryRows.map(r => r.name),
      painIntensityMap
    });
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
    const rawAreas = req.body['pain_areas[]'] || req.body.pain_areas;
    const painAreas = Array.isArray(rawAreas) ? rawAreas.join(',') : (rawAreas || null);
    const rawInjuries = req.body['selected_injuries[]'] || req.body.selected_injuries;
    const selectedInjuries = Array.isArray(rawInjuries) ? rawInjuries.join(',') : (rawInjuries || null);

    // Build per-area intensity map from individual slider fields (pain_intensity_<area>)
    let painIntensityMap = null;
    const areasArr = Array.isArray(rawAreas) ? rawAreas : (rawAreas ? [rawAreas] : []);
    if (areasArr.length > 0) {
      painIntensityMap = {};
      areasArr.forEach(area => {
        const key = 'pain_intensity_' + area.replace(/\s+/g, '_');
        const val = parseInt(req.body[key]);
        painIntensityMap[area] = isNaN(val) ? (parseInt(pain_intensity) || 5) : val;
      });
    }
    const painIntensity = painIntensityMap
      ? Math.max(...Object.values(painIntensityMap))
      : (pain_intensity !== undefined ? pain_intensity : null);

    const userId = req.session.user.id;
    await profileService.updatePainAreas(userId, {
      painAreas,
      painStatus: pain_status || null,
      painIntensity,
      painIntensityMap,
      selectedInjuries
    });

    // Sync pain areas → User_Focus_Area
    const [emojiRows] = await db.query(`SELECT name, emoji FROM Focus_Area_Option`);
    const emojiMap = {};
    emojiRows.forEach(r => { emojiMap[r.name.toLowerCase()] = r.emoji; });

    if (areasArr.length > 0) {
      for (const area of areasArr) {
        const emoji = emojiMap[area.toLowerCase()] || '🩹';
        await db.query(
          `INSERT INTO User_Focus_Area (user_id, area_name, emoji)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)`,
          [userId, area, emoji]
        );
      }
      // Remove focus areas that were deselected from pain management
      const placeholders = areasArr.map(() => '?').join(',');
      await db.query(
        `DELETE FROM User_Focus_Area WHERE user_id = ? AND area_name NOT IN (${placeholders})`,
        [userId, ...areasArr]
      );
    } else {
      // User cleared all pain areas — remove all focus areas
      await db.query(`DELETE FROM User_Focus_Area WHERE user_id = ?`, [userId]);
    }

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
      type_session_reminder:    b.type_session_reminder    === 'on',
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
