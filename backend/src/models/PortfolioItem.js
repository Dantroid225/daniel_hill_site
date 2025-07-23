const { pool } = require('../config/database');

class PortfolioItem {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM portfolio_items ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM portfolio_items WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(itemData) {
    const { title, description, image_url, project_url, technologies, category } = itemData;
    const [result] = await pool.execute(
      'INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, image_url, project_url, JSON.stringify(technologies), category]
    );
    return result.insertId;
  }

  static async update(id, itemData) {
    const { title, description, image_url, project_url, technologies, category } = itemData;
    const [result] = await pool.execute(
      'UPDATE portfolio_items SET title = ?, description = ?, image_url = ?, project_url = ?, technologies = ?, category = ?, updated_at = NOW() WHERE id = ?',
      [title, description, image_url, project_url, JSON.stringify(technologies), category, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM portfolio_items WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = PortfolioItem; 