const ConnectionManager = require('./ConnectionManager');

class ExerciseDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Find all exercises with optional filters
   * @param {Object} filters - { category, difficulty, isGymOnly, search }
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    const conn = await this.#connectionManager.getConnection();
    try {
      let query = 'SELECT * FROM exercise WHERE 1=1';
      const params = [];

      // Filter by category (strengthen, stretch, avoid)
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      // Filter by difficulty
      if (filters.difficulty) {
        query += ' AND skill_level = ?';
        params.push(filters.difficulty);
      }

      // Filter by gym/home
      if (filters.isGymOnly !== undefined) {
        query += ' AND is_gym_only = ?';
        params.push(filters.isGymOnly ? 1 : 0);
      }

      // Search by name
      if (filters.search) {
        query += ' AND name LIKE ?';
        params.push(`%${filters.search}%`);
      }

      // Filter by body part
      if (filters.bodyPart) {
        query += ' AND body_part = ?';
        params.push(filters.bodyPart);
      }

      // Filter by injury
      if (filters.injury) {
        query += ' AND injury = ?';
        params.push(filters.injury);
      }

      // Order by name
      query += ' ORDER BY name ASC';

      const [rows] = await conn.execute(query, params);
      return rows;
    } finally {
      conn.release();
    }
  }

  /**
   * Find exercise by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM exercise WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  /**
   * Search exercises by name
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchByName(query) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM exercise WHERE name LIKE ? ORDER BY name ASC LIMIT 50',
        [`%${query}%`]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  /**
   * Get exercises by muscle group
   * @param {number} muscleGroupId
   * @returns {Promise<Array>}
   */
  async findByMuscleGroup(muscleGroupId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT e.* FROM exercise e
         INNER JOIN exercise_muscle_group emg ON e.id = emg.exercise_id
         WHERE emg.muscle_group_id = ?
         ORDER BY e.name ASC`,
        [muscleGroupId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  /**
   * Increment session count for an exercise
   * @param {number} id
   */
  async incrementSessionCount(id) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        'UPDATE exercise SET sessions_count = sessions_count + 1 WHERE id = ?',
        [id]
      );
    } finally {
      conn.release();
    }
  }

  /**
   * Get all distinct body parts for filter UI
   * @returns {Promise<string[]>}
   */
  async getAllBodyParts() {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT DISTINCT body_part FROM exercise WHERE body_part IS NOT NULL ORDER BY body_part ASC'
      );
      return rows.map(r => r.body_part);
    } finally {
      conn.release();
    }
  }

  /**
   * Get all injuries from the Injury table
   * @returns {Promise<Array>}
   */
  async getAllInjuries() {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM Injury_Reference ORDER BY body_part ASC, name ASC'
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  /**
   * Get muscles for an exercise with their roles
   * @param {number} exerciseId
   * @returns {Promise<Array>}
   */
  async getMusclesForExercise(exerciseId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT mg.name, emg.role
         FROM exercise_muscle_group emg
         JOIN muscle_group mg ON mg.id = emg.muscle_group_id
         WHERE emg.exercise_id = ?
         ORDER BY FIELD(emg.role, 'targeted', 'secondary', 'all'), mg.name ASC`,
        [exerciseId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  /**
   * Get all muscle groups
   * @returns {Promise<Array>}
   */
  async getAllMuscleGroups() {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM muscle_group ORDER BY name ASC'
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}

module.exports = ExerciseDAO;
