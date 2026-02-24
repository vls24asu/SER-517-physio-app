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
}

module.exports = WorkoutSessionDAO;
