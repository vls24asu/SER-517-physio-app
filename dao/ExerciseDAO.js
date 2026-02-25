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
