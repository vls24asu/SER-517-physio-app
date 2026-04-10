/**
 * sessionReminderJob.js
 *
 * Runs every 5 minutes. Finds all scheduled sessions that are upcoming or
 * up to 2 hours overdue, then sends a session_reminder notification to each
 * user — at most once per 30-minute window per session.
 *
 * This runs independently of any dashboard visit so users receive push and
 * in-app notifications even if they never open the app.
 */

const db = require('../config/db');
const NotificationService = require('../services/NotificationService');
const NotificationDAO = require('../dao/NotificationDAO');

const notifService = new NotificationService();
const dao = new NotificationDAO();

const INTERVAL_MS = 5 * 60 * 1000; // check every 5 minutes

async function runSessionReminderJob() {
  try {
    // Find all sessions across all users in the active reminder window
    const [sessions] = await db.query(
      `SELECT ss.id, ss.user_id, ss.routine_name, ss.scheduled_at
       FROM Scheduled_Session ss
       JOIN Notification_Preferences np ON np.user_id = ss.user_id
       WHERE ss.scheduled_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
         AND ss.scheduled_at <= DATE_ADD(NOW(), INTERVAL 30 MINUTE)
         AND np.in_app_enabled = 1
         AND np.type_session_reminder = 1`
    );

    for (const session of sessions) {
      const title = `Session reminder: ${session.routine_name}`;

      // Skip if we already sent a reminder for this session in the last 30 minutes
      const alreadySent = await dao.sessionReminderSentRecently(session.user_id, title);
      if (alreadySent) continue;

      const scheduledAt = new Date(session.scheduled_at);
      const now = new Date();
      const diffMin = Math.round((now - scheduledAt) / 60000);

      let message;
      if (diffMin < 0) {
        message = `Your session "${session.routine_name}" starts in ${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''}. Get ready!`;
      } else if (diffMin === 0) {
        message = `Your session "${session.routine_name}" starts now. Time to move!`;
      } else {
        message = `Your session "${session.routine_name}" was scheduled ${diffMin} minute${diffMin !== 1 ? 's' : ''} ago. Still time to start!`;
      }

      await notifService.create(
        session.user_id,
        'session_reminder',
        title,
        message,
        { dedupe: false }
      );
    }
  } catch (err) {
    console.error('[sessionReminderJob] Error:', err.message);
  }
}

function start() {
  // Run immediately on startup, then every 5 minutes
  runSessionReminderJob();
  setInterval(runSessionReminderJob, INTERVAL_MS);
  console.log('[sessionReminderJob] Started — checking every 5 minutes.');
}

module.exports = { start };
