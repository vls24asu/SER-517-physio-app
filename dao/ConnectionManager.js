const pool = require('../config/db');

class ConnectionManager {
  static #instance = null;

  static getInstance() {
    if (!ConnectionManager.#instance) {
      ConnectionManager.#instance = new ConnectionManager();
    }
    return ConnectionManager.#instance;
  }

  async getConnection() {
    return await pool.getConnection();
  }

  getPool() {
    return pool;
  }
}

module.exports = ConnectionManager;
