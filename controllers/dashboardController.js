const StatsService = require('../services/StatsService');
const NotificationService = require('../services/NotificationService');
const db = require('../config/db');

const statsService = new StatsService();
const notifService = new NotificationService();

const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const stats = await statsService.getUserStats(userId);

    // Trigger time-based notifications (workout reminder, streak broken, pain check-in).
    // Runs fire-and-forget so a notification error never breaks the dashboard load.
    notifService.triggerDashboardNotifications(userId, stats.streak).catch(console.error);

    // Fetch next upcoming scheduled session
    const [scheduled] = await db.query(
      `SELECT id, routine_id, routine_name, scheduled_at
       FROM Scheduled_Session
       WHERE user_id = ? AND scheduled_at >= NOW()
       ORDER BY scheduled_at ASC LIMIT 1`,
      [userId]
    );
    const nextSession = scheduled.length ? scheduled[0] : null;

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
      nextSession
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong loading your dashboard.');
    res.redirect('/login');
  }
};

module.exports = { getDashboard };
