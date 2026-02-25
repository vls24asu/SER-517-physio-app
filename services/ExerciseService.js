const ExerciseDAO = require('../dao/ExerciseDAO');

class ExerciseService {
  #dao;

  constructor() {
    this.#dao = new ExerciseDAO();
  }

  /**
   * Get all exercises with optional filters
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async getAllExercises(filters = {}) {
    return await this.#dao.findAll(filters);
  }

  /**
   * Get single exercise by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getExerciseById(id) {
    return await this.#dao.findById(id);
  }

  /**
   * Search exercises by name
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchExercises(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return await this.#dao.searchByName(query.trim());
  }

  /**
   * Get exercises by muscle group
   * @param {number} muscleGroupId
   * @returns {Promise<Array>}
   */
  async getExercisesByMuscleGroup(muscleGroupId) {
    return await this.#dao.findByMuscleGroup(muscleGroupId);
  }

  /**
   * Track exercise usage
   * @param {number} id
   */
  async trackExerciseUsage(id) {
    await this.#dao.incrementSessionCount(id);
  }

  /**
   * Get all muscle groups
   * @returns {Promise<Array>}
   */
  async getAllMuscleGroups() {
    return await this.#dao.getAllMuscleGroups();
  }
}

module.exports = ExerciseService;
