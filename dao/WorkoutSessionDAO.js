const ConnectionManager = require('./ConnectionManager');

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
        `SELECT wse.name, wse.category, wse.sets, wse.reps, wse.hold_time_sec
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

  async getChartData(userId, period) {
    const conn = await this.#connectionManager.getConnection();
    try {
      if (period === 'week') {
        const [rows] = await conn.execute(
          `SELECT DAYOFWEEK(session_date) as dow, COUNT(*) as cnt
           FROM Workout_Session
           WHERE user_id = ? AND YEARWEEK(session_date, 1) = YEARWEEK(CURDATE(), 1)
           GROUP BY dow`,
          [userId]
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
          `SELECT FLOOR((DAYOFMONTH(session_date) - 1) / 7) + 1 AS week_num,
                  COUNT(*) AS cnt
           FROM Workout_Session
           WHERE user_id = ?
             AND YEAR(session_date)  = YEAR(CURDATE())
             AND MONTH(session_date) = MONTH(CURDATE())
           GROUP BY week_num
           ORDER BY week_num`,
          [userId]
        );
        const weekMap = {};
        rows.forEach(r => { weekMap[r.week_num] = Number(r.cnt); });
        return [1, 2, 3, 4, 5].map(w => ({ label: `W${w}`, count: weekMap[w] || 0 }));
      }

      // year
      const [rows] = await conn.execute(
        `SELECT MONTH(session_date) AS month_num, COUNT(*) AS cnt
         FROM Workout_Session
         WHERE user_id = ? AND YEAR(session_date) = YEAR(CURDATE())
         GROUP BY month_num`,
        [userId]
      );
      const monthMap = {};
      rows.forEach(r => { monthMap[r.month_num] = Number(r.cnt); });
      const monthLabels = ['J','F','M','A','M','J','J','A','S','O','N','D'];
      return monthLabels.map((label, i) => ({ label, count: monthMap[i + 1] || 0 }));
    } finally {
      conn.release();
    }
  }

  async getSessionCountForPeriod(userId, period) {
    const conn = await this.#connectionManager.getConnection();
    try {
      let where;
      if (period === 'week') {
        where = `AND YEARWEEK(session_date, 1) = YEARWEEK(CURDATE(), 1)`;
      } else if (period === 'month') {
        where = `AND YEAR(session_date) = YEAR(CURDATE()) AND MONTH(session_date) = MONTH(CURDATE())`;
      } else {
        where = `AND YEAR(session_date) = YEAR(CURDATE())`;
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

  async getExercisesForPeriod(userId, period) {
    const conn = await this.#connectionManager.getConnection();
    try {
      let where;
      if (period === 'week') {
        where = `AND YEARWEEK(ws.session_date, 1) = YEARWEEK(CURDATE(), 1)`;
      } else if (period === 'month') {
        where = `AND YEAR(ws.session_date) = YEAR(CURDATE()) AND MONTH(ws.session_date) = MONTH(CURDATE())`;
      } else {
        where = `AND YEAR(ws.session_date) = YEAR(CURDATE())`;
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
