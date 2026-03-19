const WorkoutSessionDAO = require('../dao/WorkoutSessionDAO');

class WorkoutSessionService {
  #dao;

  constructor() {
    this.#dao = new WorkoutSessionDAO();
  }

  async getHistory(userId) {
    const rows = await this.#dao.findByUserId(userId);
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      durationMin: row.duration_min,
      exerciseCount: row.exercise_count,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      emoji: row.emoji || '🏋️',
      sessionDate: row.session_date
    }));
  }

  async getSessionDetail(sessionId, userId) {
    const row = await this.#dao.findByIdAndUserId(sessionId, userId);
    if (!row) return null;
    const exercises = await this.#dao.getExercisesForSession(sessionId);
    return {
      id: row.id,
      title: row.title,
      durationMin: row.duration_min,
      exerciseCount: row.exercise_count,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      emoji: row.emoji || '🏋️',
      sessionDate: row.session_date,
      exercises
    };
  }

  async getChartData(userId, period) {
    return this.#dao.getChartData(userId, period);
  }

  async getSessionCountForPeriod(userId, period) {
    return this.#dao.getSessionCountForPeriod(userId, period);
  }

  async getExercisesForPeriod(userId, period) {
    return this.#dao.getExercisesForPeriod(userId, period);
  }
}

module.exports = WorkoutSessionService;
