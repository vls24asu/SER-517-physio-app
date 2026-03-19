const ConnectionManager = require('./ConnectionManager');

class StatsDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  async getUserStats(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      // Total sessions and total time from Workout_Session
      const [totals] = await conn.execute(
        `SELECT COUNT(*) AS total_sessions,
                COALESCE(SUM(duration_min), 0) AS total_minutes
         FROM Workout_Session
         WHERE user_id = ?`,
        [userId]
      );

      const totalSessions = Number(totals[0]?.total_sessions) || 0;
      const totalMinutes  = Number(totals[0]?.total_minutes)  || 0;
      const totalHours    = (totalMinutes / 60).toFixed(1);

      // Sessions this week
      const [weekStats] = await conn.execute(
        `SELECT COUNT(*) AS sessions_this_week,
                COALESCE(SUM(duration_min), 0) AS minutes_this_week
         FROM Workout_Session
         WHERE user_id = ?
           AND YEARWEEK(session_date, 1) = YEARWEEK(CURDATE(), 1)`,
        [userId]
      );

      const sessionsThisWeek = Number(weekStats[0]?.sessions_this_week) || 0;
      const minutesThisWeek  = Number(weekStats[0]?.minutes_this_week)  || 0;

      // Streak — consecutive days with at least one session
      const [streakData] = await conn.execute(
        `SELECT DATE(session_date) AS session_date
         FROM Workout_Session
         WHERE user_id = ?
         GROUP BY DATE(session_date)
         ORDER BY session_date DESC`,
        [userId]
      );

      let streak = 0;
      if (streakData.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let expectedDate = new Date(today);

        for (let i = 0; i < streakData.length; i++) {
          const sd = new Date(streakData[i].session_date);
          sd.setHours(0, 0, 0, 0);

          if (i === 0 && sd.getTime() === expectedDate.getTime()) {
            streak = 1;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else if (i === 0 && sd.getTime() === expectedDate.getTime() - 86400000) {
            streak = 1;
            expectedDate.setDate(expectedDate.getDate() - 2);
          } else if (sd.getTime() === expectedDate.getTime()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      return {
        totalSessions,
        totalTime: totalHours,
        streak,
        sessionsThisWeek,
        minutesThisWeek
      };
    } finally {
      conn.release();
    }
  }
}

module.exports = StatsDAO;
