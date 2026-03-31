const ConnectionManager = require('./ConnectionManager');

class NotificationDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  async create(userId, type, title, message) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO Notification (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
        [userId, type, title, message]
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  async getAll(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM Notification WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async getUnreadCount(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM Notification WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
      return Number(rows[0].cnt) || 0;
    } finally {
      conn.release();
    }
  }

  // Prevents duplicate notifications of the same type on the same day.
  // Pass title to also deduplicate by title (used for achievements).
  async existsToday(userId, type, title = null) {
    const conn = await this.#connectionManager.getConnection();
    try {
      let query = `SELECT COUNT(*) AS cnt FROM Notification WHERE user_id = ? AND type = ? AND DATE(created_at) = CURDATE()`;
      const params = [userId, type];
      if (title) {
        query += ` AND title = ?`;
        params.push(title);
      }
      const [rows] = await conn.execute(query, params);
      return Number(rows[0].cnt) > 0;
    } finally {
      conn.release();
    }
  }

  async markAsRead(notificationId, userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `UPDATE Notification SET is_read = TRUE WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
    } finally {
      conn.release();
    }
  }

  async markAllAsRead(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `UPDATE Notification SET is_read = TRUE WHERE user_id = ?`,
        [userId]
      );
    } finally {
      conn.release();
    }
  }

  async deleteOne(notificationId, userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `DELETE FROM Notification WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
    } finally {
      conn.release();
    }
  }

  // ── Push Subscription ────────────────────────────────────────────────────

  async savePushSubscription(userId, endpoint, p256dh, auth) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `DELETE FROM Push_Subscription WHERE user_id = ? AND endpoint = ?`,
        [userId, endpoint]
      );
      await conn.execute(
        `INSERT INTO Push_Subscription (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)`,
        [userId, endpoint, p256dh, auth]
      );
    } finally {
      conn.release();
    }
  }

  async getPushSubscriptions(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT endpoint, p256dh, auth FROM Push_Subscription WHERE user_id = ?`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async deletePushSubscription(userId, endpoint) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `DELETE FROM Push_Subscription WHERE user_id = ? AND endpoint = ?`,
        [userId, endpoint]
      );
    } finally {
      conn.release();
    }
  }

  async deleteAll(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(`DELETE FROM Notification WHERE user_id = ?`, [userId]);
    } finally {
      conn.release();
    }
  }

  // ── Notification Preferences ─────────────────────────────────────────────

  static #DEFAULT_PREFS = {
    in_app_enabled: true,
    push_enabled: true,
    type_session_completed: true,
    type_achievement_unlocked: true,
    type_streak_active: true,
    type_streak_broken: true,
    type_progress_milestone: true,
    type_pain_checkin: true,
    type_workout_reminder: true,
    reminder_time: '09:00',
    timezone: 'UTC'
  };

  async getPreferences(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM Notification_Preferences WHERE user_id = ?`,
        [userId]
      );
      return rows[0] || { ...NotificationDAO.#DEFAULT_PREFS, user_id: userId };
    } finally {
      conn.release();
    }
  }

  async upsertPreferences(userId, prefs) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `INSERT INTO Notification_Preferences
           (user_id, in_app_enabled, push_enabled,
            type_session_completed, type_achievement_unlocked, type_streak_active,
            type_streak_broken, type_progress_milestone, type_pain_checkin,
            type_workout_reminder, reminder_time, timezone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           in_app_enabled = VALUES(in_app_enabled),
           push_enabled = VALUES(push_enabled),
           type_session_completed = VALUES(type_session_completed),
           type_achievement_unlocked = VALUES(type_achievement_unlocked),
           type_streak_active = VALUES(type_streak_active),
           type_streak_broken = VALUES(type_streak_broken),
           type_progress_milestone = VALUES(type_progress_milestone),
           type_pain_checkin = VALUES(type_pain_checkin),
           type_workout_reminder = VALUES(type_workout_reminder),
           reminder_time = VALUES(reminder_time),
           timezone = VALUES(timezone)`,
        [
          userId,
          prefs.in_app_enabled,
          prefs.push_enabled,
          prefs.type_session_completed,
          prefs.type_achievement_unlocked,
          prefs.type_streak_active,
          prefs.type_streak_broken,
          prefs.type_progress_milestone,
          prefs.type_pain_checkin,
          prefs.type_workout_reminder,
          prefs.reminder_time,
          prefs.timezone || 'UTC'
        ]
      );
    } finally {
      conn.release();
    }
  }

  // ── Dashboard trigger helpers ────────────────────────────────────────────

  async getSessionCountToday(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM Workout_Session WHERE user_id = ? AND DATE(session_date) = CURDATE()`,
        [userId]
      );
      return Number(rows[0].cnt) || 0;
    } finally {
      conn.release();
    }
  }

  async getLastSessionDate(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT MAX(DATE(session_date)) AS last_date FROM Workout_Session WHERE user_id = ?`,
        [userId]
      );
      return rows[0].last_date || null;
    } finally {
      conn.release();
    }
  }

  async getUserPainProfile(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT pain_status, pain_areas FROM User_Profile WHERE user_id = ?`,
        [userId]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }
}

module.exports = NotificationDAO;
