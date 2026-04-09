const StatsService = require('../services/StatsService');
const NotificationService = require('../services/NotificationService');
const db = require('../config/db');

const statsService = new StatsService();
const notifService = new NotificationService();

const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const stats = await statsService.getUserStats(userId);

    // Load today's check-in log to show status on dashboard
    const today = new Date().toISOString().split('T')[0];
    let todayCheckin = null;
    try {
      const [rows] = await db.query(
        `SELECT feeling, pain_scale, area_name, pain_status
         FROM Body_Checkin_Log
         WHERE user_id = ? AND log_date = ?
         ORDER BY created_at DESC LIMIT 1`,
        [userId, today]
      );
      todayCheckin = rows[0] || null;
    } catch (e) {
      // column may not exist on older DBs — silently ignore
    }

    // Trigger time-based notifications (workout reminder, streak broken, pain check-in).
    // Runs fire-and-forget so a notification error never breaks the dashboard load.
    notifService.triggerDashboardNotifications(userId, stats.streak).catch(console.error);

    // Fetch all upcoming scheduled sessions (persist card up to 2h past scheduled time)
    const [scheduledSessions] = await db.query(
      `SELECT id, routine_id, routine_name, scheduled_at
       FROM Scheduled_Session
       WHERE user_id = ? AND scheduled_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
       ORDER BY scheduled_at ASC`,
      [userId]
    );

    // Fetch last completed workout for the "last workout" card
    let lastWorkout = null;
    try {
      const [lwRows] = await db.query(
        `SELECT ws.id, ws.routine_name, ws.session_date, ws.duration_min,
                wf.overall_pain, wf.felt_after
         FROM Workout_Session ws
         LEFT JOIN Workout_Feedback wf ON wf.session_id = ws.id
         WHERE ws.user_id = ?
         ORDER BY ws.session_date DESC LIMIT 1`,
        [userId]
      );
      lastWorkout = lwRows[0] || null;
    } catch (e) {
      // Workout_Feedback may not exist yet — silently ignore
    }

    // Get greeting based on time of day
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    res.render('dashboard/index', {
      greeting,
      stats,
      user: req.session.user,
      scheduledSessions,
      todayCheckin,
      lastWorkout
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your dashboard.');
    res.redirect('/login');
  }
};

module.exports = { getDashboard };
