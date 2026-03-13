const bcrypt = require('bcrypt');
const UserProfileDAO = require('../dao/UserProfileDAO');

class UserProfileService {
  #dao;

  constructor() {
    this.#dao = new UserProfileDAO();
  }

  async getProfile(userId) {
    return await this.#dao.findByUserId(userId);
  }

  async updatePersonalInfo(userId, { age, gender }) {
    await this.#dao.upsertPersonalInfo(userId, { age, gender });
  }

  async updateBodyMetrics(userId, { heightCm, weightKg }) {
    await this.#dao.upsertBodyMetrics(userId, { heightCm, weightKg });
  }

  async updateGoalsAndPreferences(userId, { fitnessLevel, exercisePreference, workoutDurationMin, goals, availableEquipment }) {
    await this.#dao.upsertGoalsAndPreferences(userId, { fitnessLevel, exercisePreference, workoutDurationMin, goals, availableEquipment });
  }

  async updatePainAreas(userId, { painAreas, painStatus, painIntensity }) {
    await this.#dao.upsertPainAreas(userId, { painAreas, painStatus, painIntensity });
  }

  async updateNameEmail(userId, { fullName, email }) {
    await this.#dao.updateUserNameEmail(userId, { fullName, email });
  }

  async changePassword(userId, currentPassword, newPassword) {
    const hash = await this.#dao.getPasswordHash(userId);
    if (!hash) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPassword, hash);
    if (!isValid) throw new Error('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.#dao.updatePassword(userId, newHash);
  }
}

module.exports = UserProfileService;
