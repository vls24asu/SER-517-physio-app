const db = require('../config/db');

async function attachTimezone(req, res, next) {
  res.locals.userTimezone = 'UTC';
  if (req.session && req.session.user) {
    try {
      const [rows] = await db.query(
        `SELECT timezone FROM Notification_Preferences WHERE user_id = ? LIMIT 1`,
        [req.session.user.id]
      );
      if (rows[0]?.timezone) {
        res.locals.userTimezone = rows[0].timezone;
      }
    } catch (e) {
      // non-fatal — fall back to UTC
    }
  }
  next();
}

module.exports = attachTimezone;
