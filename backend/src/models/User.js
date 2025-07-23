const { pool } = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  }

  static async update(id, userData) {
    const { name, email } = userData;
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?',
      [name, email, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User; 