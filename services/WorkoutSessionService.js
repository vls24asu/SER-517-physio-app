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
}

module.exports = WorkoutSessionService;
