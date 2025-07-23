const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findAdminByEmail(email) {
    console.log("Searching for admin with email:", email);

    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND role = "admin"',
        [email]
      );

      console.log("Query result rows:", rows.length);
      if (rows.length > 0) {
        console.log("Found admin user:", {
          id: rows[0].id,
          email: rows[0].email,
          role: rows[0].role,
        });
      } else {
        console.log("No admin user found");
      }

      return rows[0];
    } catch (error) {
      console.error("Error in findAdminByEmail:", error);
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async isAdmin(userId) {
    const [rows] = await pool.execute("SELECT role FROM users WHERE id = ?", [
      userId,
    ]);
    return rows[0]?.role === "admin";
  }

  static async create(userData) {
    const { name, email, password, role = "user" } = userData;

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  }

  static async createAdmin(adminData) {
    const { name, email, password } = adminData;

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "admin")',
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  static async update(id, userData) {
    const { name, email } = userData;
    const [result] = await pool.execute(
      "UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?",
      [name, email, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    // Hash new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const [result] = await pool.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  static async verifyPassword(userId, password) {
    const [rows] = await pool.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return false;
    }

    return await bcrypt.compare(password, rows[0].password);
  }
}

module.exports = User;
