/**
 * dailyNotificationsJob.js
 *
 * Runs every 15 minutes. For every patient user who has in-app notifications
 * enabled, fires all time-based notifications (workout reminder, streak broken,
 * pain check-in) independently of any dashboard visit.
 *
 * Each notification type is still deduped to once per day via existsToday(),
 * so running this every 15 minutes does not spam users.
 */

const db = require('../config/db');
const StatsService = require('../services/StatsService');
const NotificationService = require('../services/NotificationService');

const statsService = new StatsService();
const notifService = new NotificationService();

const INTERVAL_MS = 15 * 60 * 1000; // run every 15 minutes

async function runDailyNotificationsJob() {
  try {
    // Fetch all patient users who have in-app notifications enabled
    const [users] = await db.query(
      `SELECT u.id
       FROM User u
       JOIN Notification_Preferences np ON np.user_id = u.id
       WHERE u.role = 'patient' AND np.in_app_enabled = 1`
    );

    for (const { id: userId } of users) {
      try {
        const stats = await statsService.getUserStats(userId);
        await notifService.triggerDashboardNotifications(userId, stats.streak);
      } catch (err) {
        // Don't let one user's error stop the rest
        console.error(`[dailyNotificationsJob] Error for user ${userId}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[dailyNotificationsJob] Error:', err.message);
  }
}

function start() {
  // Run immediately on startup, then every 15 minutes
  runDailyNotificationsJob();
  setInterval(runDailyNotificationsJob, INTERVAL_MS);
  console.log('[dailyNotificationsJob] Started — checking every 15 minutes.');
}

module.exports = { start };
