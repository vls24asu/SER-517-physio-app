const ConnectionManager = require('./ConnectionManager');

class UserProfileDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  async findByUserId(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM User_Profile WHERE user_id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async upsertPersonalInfo(userId, { age, gender }) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `INSERT INTO User_Profile (user_id, age, gender)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE age = VALUES(age), gender = VALUES(gender), updated_at = CURRENT_TIMESTAMP`,
        [userId, age || null, gender || null]
      );
    } finally {
      conn.release();
    }
  }

  async upsertBodyMetrics(userId, { heightCm, weightKg }) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `INSERT INTO User_Profile (user_id, height_cm, weight_kg)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE height_cm = VALUES(height_cm), weight_kg = VALUES(weight_kg), updated_at = CURRENT_TIMESTAMP`,
        [userId, heightCm || null, weightKg || null]
      );
    } finally {
      conn.release();
    }
  }

  async upsertGoalsAndPreferences(userId, { fitnessLevel, exercisePreference, workoutDurationMin, goals, availableEquipment }) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `INSERT INTO User_Profile (user_id, fitness_level, exercise_preference, workout_duration_min, goals, available_equipment)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           fitness_level = VALUES(fitness_level),
           exercise_preference = VALUES(exercise_preference),
           workout_duration_min = VALUES(workout_duration_min),
           goals = VALUES(goals),
           available_equipment = VALUES(available_equipment),
           updated_at = CURRENT_TIMESTAMP`,
        [userId, fitnessLevel || 'beginner', exercisePreference || 'both', workoutDurationMin || 30, goals || null, availableEquipment || null]
      );
    } finally {
      conn.release();
    }
  }

  async upsertPainAreas(userId, { painAreas, painStatus, painIntensity }) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        `INSERT INTO User_Profile (user_id, pain_areas, pain_status, pain_intensity)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           pain_areas = VALUES(pain_areas),
           pain_status = VALUES(pain_status),
           pain_intensity = VALUES(pain_intensity),
           updated_at = CURRENT_TIMESTAMP`,
        [userId, painAreas || null, painStatus || null, painIntensity !== undefined && painIntensity !== null ? parseInt(painIntensity) : null]
      );
    } finally {
      conn.release();
    }
  }

  async updateUserNameEmail(userId, { fullName, email }) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        'UPDATE User SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [fullName, email, userId]
      );
    } finally {
      conn.release();
    }
  }

  async updatePassword(userId, newHashedPassword) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        'UPDATE User SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newHashedPassword, userId]
      );
    } finally {
      conn.release();
    }
  }

  async getPasswordHash(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT password FROM User WHERE id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0].password : null;
    } finally {
      conn.release();
    }
  }

  async getOnboardingStatus(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT onboarding_completed FROM User WHERE id = ?',
        [userId]
      );
      if (rows.length === 0) return { completed: false, step: 1 };
      return { completed: !!rows[0].onboarding_completed, step: 1 };
    } finally {
      conn.release();
    }
  }
}

module.exports = UserProfileDAO;
