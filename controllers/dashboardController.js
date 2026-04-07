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

    // Fetch all upcoming scheduled sessions
    const [scheduledSessions] = await db.query(
      `SELECT id, routine_id, routine_name, scheduled_at
       FROM Scheduled_Session
       WHERE user_id = ? AND scheduled_at >= NOW()
       ORDER BY scheduled_at ASC`,
      [userId]
    );

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
      todayCheckin
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your dashboard.');
    res.redirect('/login');
  }
};

module.exports = { getDashboard };
