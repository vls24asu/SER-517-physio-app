const bcrypt = require('bcrypt');
const UserDAO = require('../dao/UserDAO');
const UserDTO = require('../dto/UserDTO');

class UserService {
  #userDAO;

  constructor() {
    this.#userDAO = new UserDAO();
  }

  async register(fullName, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.#userDAO.create(fullName, email, hashedPassword);
  }

  async authenticate(email, password) {
    const user = await this.#userDAO.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return new UserDTO({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      twofaEnabled: user.twofa_enabled
    });
  }

  async isEmailTaken(email) {
    return await this.#userDAO.isEmailTaken(email);
  }

  async getUserById(id) {
    return await this.#userDAO.findById(id);
  }

  async enableTwoFa(userId, secret) {
    await this.#userDAO.updateTwoFaSecret(userId, secret);
  }

  async disableTwoFa(userId) {
    await this.#userDAO.clearTwoFaSecret(userId);
  }
}

module.exports = UserService;
