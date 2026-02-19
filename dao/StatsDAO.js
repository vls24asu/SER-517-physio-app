const ConnectionManager = require('./ConnectionManager');

class StatsDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  async getUserStats(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      // Get total sessions (completed routine entries grouped by date)
      const [sessions] = await conn.execute(
        `SELECT COUNT(DISTINCT DATE(created_at)) as total_sessions
         FROM Routine_Entry
         WHERE user_id = ? AND is_completed = TRUE`,
        [userId]
      );

      // Get total time (estimate: average 15 minutes per session)
      const totalSessions = sessions[0]?.total_sessions || 0;
      const totalMinutes = totalSessions * 15; // Estimate
      const totalHours = (totalMinutes / 60).toFixed(1);

      // Get current week stats
      const [weekStats] = await conn.execute(
        `SELECT COUNT(DISTINCT DATE(created_at)) as sessions_this_week
         FROM Routine_Entry
         WHERE user_id = ? 
         AND is_completed = TRUE
         AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`,
        [userId]
      );

      const sessionsThisWeek = weekStats[0]?.sessions_this_week || 0;
      const minutesThisWeek = sessionsThisWeek * 15; // Estimate

      // Calculate streak (consecutive days with completed exercises)
      const [streakData] = await conn.execute(
        `SELECT DATE(created_at) as session_date
         FROM Routine_Entry
         WHERE user_id = ? AND is_completed = TRUE
         GROUP BY DATE(created_at)
         ORDER BY session_date DESC`,
        [userId]
      );

      let streak = 0;
      if (streakData.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let expectedDate = new Date(today);
        for (let i = 0; i < streakData.length; i++) {
          const sessionDate = new Date(streakData[i].session_date);
          sessionDate.setHours(0, 0, 0, 0);
          
          if (i === 0 && sessionDate.getTime() === expectedDate.getTime()) {
            // Today's session exists
            streak = 1;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
            // Yesterday's session exists (missed today)
            streak = 1;
            expectedDate.setDate(expectedDate.getDate() - 2);
          } else if (sessionDate.getTime() === expectedDate.getTime()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      return {
        totalSessions: totalSessions,
        totalTime: totalHours,
        streak: streak,
        sessionsThisWeek: sessionsThisWeek,
        minutesThisWeek: minutesThisWeek
      };
    } finally {
      conn.release();
    }
  }
}

module.exports = StatsDAO;
