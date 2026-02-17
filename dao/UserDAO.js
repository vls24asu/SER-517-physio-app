const ConnectionManager = require('./ConnectionManager');
const UserDTO = require('../dto/UserDTO');

class UserDAO {
  #connectionManager;

  constructor() {
    this.#connectionManager = ConnectionManager.getInstance();
  }

  async findByEmail(email) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM User WHERE email = ?',
        [email]
      );
      if (rows.length === 0) return null;
      return rows[0];
    } finally {
      conn.release();
    }
  }

  async findById(id) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT id, full_name, email, role, twofa_enabled, twofa_secret FROM User WHERE id = ?',
        [id]
      );
      if (rows.length === 0) return null;
      const row = rows[0];
      return new UserDTO({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        twofaEnabled: row.twofa_enabled
      });
    } finally {
      conn.release();
    }
  }

  async create(fullName, email, hashedPassword) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        'INSERT INTO User (full_name, email, password) VALUES (?, ?, ?)',
        [fullName, email, hashedPassword]
      );
    } finally {
      conn.release();
    }
  }

  async isEmailTaken(email) {
    const conn = await this.#connectionManager.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT 1 FROM User WHERE email = ?',
        [email]
      );
      return rows.length > 0;
    } finally {
      conn.release();
    }
  }

  async updateTwoFaSecret(userId, secret) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        'UPDATE User SET twofa_enabled = TRUE, twofa_secret = ? WHERE id = ?',
        [secret, userId]
      );
    } finally {
      conn.release();
    }
  }

  async clearTwoFaSecret(userId) {
    const conn = await this.#connectionManager.getConnection();
    try {
      await conn.execute(
        'UPDATE User SET twofa_enabled = FALSE, twofa_secret = NULL WHERE id = ?',
        [userId]
      );
    } finally {
      conn.release();
    }
  }
}

module.exports = UserDAO;
