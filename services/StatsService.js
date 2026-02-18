const StatsDAO = require('../dao/StatsDAO');

class StatsService {
  #statsDAO;

  constructor() {
    this.#statsDAO = new StatsDAO();
  }

  async getUserStats(userId) {
    return await this.#statsDAO.getUserStats(userId);
  }
}

module.exports = StatsService;
