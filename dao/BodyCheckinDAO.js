const ConnectionManager = require('./ConnectionManager');

class BodyCheckinDAO {
  #cm;

  constructor() {
    this.#cm = ConnectionManager.getInstance();
  }

  // ── Focus Area Options (the selectable list) ─────────────────────────────

  async getAreaOptions() {
    const conn = await this.#cm.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT name, emoji FROM Focus_Area_Option ORDER BY sort_order ASC`
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  // ── Focus Areas ──────────────────────────────────────────────────────────

  async getFocusAreas(userId) {
    const conn = await this.#cm.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT area_name, emoji FROM User_Focus_Area WHERE user_id = ? ORDER BY created_at ASC`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async addFocusArea(userId, areaName, emoji) {
    const conn = await this.#cm.getConnection();
    try {
      await conn.execute(
        `INSERT INTO User_Focus_Area (user_id, area_name, emoji)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)`,
        [userId, areaName, emoji]
      );
    } finally {
      conn.release();
    }
  }

  // ── Check-in Logs ────────────────────────────────────────────────────────

  // Returns all log entries for a user+area as { log_date (YYYY-MM-DD), pain_status, pain_scale, notes }
  async getLogs(userId, areaName) {
    const conn = await this.#cm.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT DATE_FORMAT(log_date, '%Y-%m-%d') AS log_date,
                pain_status, pain_scale, notes
         FROM Body_Checkin_Log
         WHERE user_id = ? AND area_name = ?
         ORDER BY log_date DESC`,
        [userId, areaName]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  // Returns a single log for a specific date (or null)
  async getLogForDate(userId, areaName, date) {
    const conn = await this.#cm.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT DATE_FORMAT(log_date, '%Y-%m-%d') AS log_date,
                pain_status, pain_scale, notes
         FROM Body_Checkin_Log
         WHERE user_id = ? AND area_name = ? AND log_date = ?`,
        [userId, areaName, date]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  // Upsert a log entry
  async saveLog(userId, areaName, date, painStatus, painScale, notes) {
    const conn = await this.#cm.getConnection();
    try {
      await conn.execute(
        `INSERT INTO Body_Checkin_Log (user_id, area_name, log_date, pain_status, pain_scale, notes)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           pain_status = VALUES(pain_status),
           pain_scale  = VALUES(pain_scale),
           notes       = VALUES(notes),
           updated_at  = CURRENT_TIMESTAMP`,
        [userId, areaName, date, painStatus, painScale, notes || null]
      );
    } finally {
      conn.release();
    }
  }
}

module.exports = BodyCheckinDAO;
