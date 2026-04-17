const ConnectionManager = require('./ConnectionManager');

// Convert IANA timezone name to a MySQL-compatible UTC offset string e.g. "+05:30"
function utcOffsetString(timezone) {
  try {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetMin = Math.round((tzDate - utcDate) / 60000);
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const h = String(Math.floor(abs / 60)).padStart(2, '0');
    const m = String(abs % 60).padStart(2, '0');
    return `${sign}${h}:${m}`;
  } catch (e) {
    return '+00:00';
  }
}

class WorkoutSessionDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  async findByUserId(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM Workout_Session
         WHERE user_id = ?
         ORDER BY session_date DESC`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async findByIdAndUserId(sessionId, userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM Workout_Session WHERE id = ? AND user_id = ?`,
        [sessionId, userId]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  async getExercisesForSession(sessionId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT wse.name, wse.category, wse.sets, wse.reps, wse.hold_time_sec,
                wse.sets_completed, wse.reps_completed, wse.weight_used, wse.pain_during_exercise AS pain_during
         FROM Workout_Session_Exercise wse
         WHERE wse.session_id = ?
         ORDER BY wse.sort_order ASC`,
        [sessionId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async getChartData(userId, period, timezone = 'UTC') {
    const conn = await this.#connectionManager.getConnection();
    const tz = utcOffsetString(timezone);
    try {
      if (period === 'week') {
        const [rows] = await conn.execute(
          `SELECT DAYOFWEEK(CONVERT_TZ(session_date, '+00:00', ?)) as dow, COUNT(*) as cnt
           FROM Workout_Session
           WHERE user_id = ? AND YEARWEEK(CONVERT_TZ(session_date, '+00:00', ?), 1) = YEARWEEK(CONVERT_TZ(NOW(), '+00:00', ?), 1)
           GROUP BY dow`,
          [tz, userId, tz, tz]
        );
        const dowMap = {};
        rows.forEach(r => { dowMap[r.dow] = Number(r.cnt); });
        // MySQL DAYOFWEEK: 1=Sun,2=Mon,...,7=Sat — render Mon-Sun
        const dows  = [2, 3, 4, 5, 6, 7, 1];
        const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        return labels.map((label, i) => ({ label, count: dowMap[dows[i]] || 0 }));
      }

      if (period === 'month') {
        const [rows] = await conn.execute(
          `SELECT FLOOR((DAYOFMONTH(CONVERT_TZ(session_date, '+00:00', ?)) - 1) / 7) + 1 AS week_num,
                  COUNT(*) AS cnt
           FROM Workout_Session
           WHERE user_id = ?
             AND YEAR(CONVERT_TZ(session_date, '+00:00', ?))  = YEAR(CONVERT_TZ(NOW(), '+00:00', ?))
             AND MONTH(CONVERT_TZ(session_date, '+00:00', ?)) = MONTH(CONVERT_TZ(NOW(), '+00:00', ?))
           GROUP BY week_num
           ORDER BY week_num`,
          [tz, userId, tz, tz, tz, tz]
        );
        const weekMap = {};
        rows.forEach(r => { weekMap[r.week_num] = Number(r.cnt); });
        return [1, 2, 3, 4, 5].map(w => ({ label: `W${w}`, count: weekMap[w] || 0 }));
      }

      // year
      const [rows] = await conn.execute(
        `SELECT MONTH(CONVERT_TZ(session_date, '+00:00', ?)) AS month_num, COUNT(*) AS cnt
         FROM Workout_Session
         WHERE user_id = ? AND YEAR(CONVERT_TZ(session_date, '+00:00', ?)) = YEAR(CONVERT_TZ(NOW(), '+00:00', ?))
         GROUP BY month_num`,
        [tz, userId, tz, tz]
      );
      const monthMap = {};
      rows.forEach(r => { monthMap[r.month_num] = Number(r.cnt); });
      const monthLabels = ['J','F','M','A','M','J','J','A','S','O','N','D'];
      return monthLabels.map((label, i) => ({ label, count: monthMap[i + 1] || 0 }));
    } finally {
      conn.release();
    }
  }

  async getSessionCountForPeriod(userId, period, timezone = 'UTC') {
    const conn = await this.#connectionManager.getConnection();
    const tz = utcOffsetString(timezone);
    try {
      let where;
      if (period === 'week') {
        where = `AND YEARWEEK(CONVERT_TZ(session_date, '+00:00', '${tz}'), 1) = YEARWEEK(CONVERT_TZ(NOW(), '+00:00', '${tz}'), 1)`;
      } else if (period === 'month') {
        where = `AND YEAR(CONVERT_TZ(session_date, '+00:00', '${tz}')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '${tz}')) AND MONTH(CONVERT_TZ(session_date, '+00:00', '${tz}')) = MONTH(CONVERT_TZ(NOW(), '+00:00', '${tz}'))`;
      } else {
        where = `AND YEAR(CONVERT_TZ(session_date, '+00:00', '${tz}')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '${tz}'))`;
      }
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS cnt, COALESCE(SUM(duration_min), 0) AS total_min
         FROM Workout_Session
         WHERE user_id = ? ${where}`,
        [userId]
      );
      return { count: Number(rows[0].cnt) || 0, totalMin: Number(rows[0].total_min) || 0 };
    } finally {
      conn.release();
    }
  }

  async getExercisesForPeriod(userId, period, timezone = 'UTC') {
    const conn = await this.#connectionManager.getConnection();
    const tz = utcOffsetString(timezone);
    try {
      let where;
      if (period === 'week') {
        where = `AND YEARWEEK(CONVERT_TZ(ws.session_date, '+00:00', '${tz}'), 1) = YEARWEEK(CONVERT_TZ(NOW(), '+00:00', '${tz}'), 1)`;
      } else if (period === 'month') {
        where = `AND YEAR(CONVERT_TZ(ws.session_date, '+00:00', '${tz}')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '${tz}')) AND MONTH(CONVERT_TZ(ws.session_date, '+00:00', '${tz}')) = MONTH(CONVERT_TZ(NOW(), '+00:00', '${tz}'))`;
      } else {
        where = `AND YEAR(CONVERT_TZ(ws.session_date, '+00:00', '${tz}')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '${tz}'))`;
      }
      const [rows] = await conn.execute(
        `SELECT DISTINCT wse.name, wse.category
         FROM Workout_Session ws
         JOIN Workout_Session_Exercise wse ON wse.session_id = ws.id
         WHERE ws.user_id = ? ${where}
         ORDER BY wse.name ASC`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}

module.exports = WorkoutSessionDAO;
