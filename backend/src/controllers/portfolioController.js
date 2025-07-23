const { pool } = require('../config/database');
const { sendResponse } = require('../utils/responseHelper');

const portfolioController = {
  // Get all portfolio items
  getAllPortfolioItems: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM portfolio_items ORDER BY created_at DESC'
      );
      return sendResponse(res, 200, true, 'Portfolio items retrieved successfully', rows);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      return sendResponse(res, 500, false, 'Failed to fetch portfolio items');
    }
  },

  // Get portfolio item by ID
  getPortfolioItemById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        'SELECT * FROM portfolio_items WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }
      
      return sendResponse(res, 200, true, 'Portfolio item retrieved successfully', rows[0]);
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to fetch portfolio item');
    }
  },

  // Create new portfolio item
  createPortfolioItem: async (req, res) => {
    try {
      const { title, description, image_url, project_url, technologies, category } = req.body;
      
      const [result] = await pool.execute(
        'INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, image_url, project_url, JSON.stringify(technologies), category]
      );
      
      return sendResponse(res, 201, true, 'Portfolio item created successfully', { id: result.insertId });
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to create portfolio item');
    }
  },

  // Update portfolio item
  updatePortfolioItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, image_url, project_url, technologies, category } = req.body;
      
      const [result] = await pool.execute(
        'UPDATE portfolio_items SET title = ?, description = ?, image_url = ?, project_url = ?, technologies = ?, category = ?, updated_at = NOW() WHERE id = ?',
        [title, description, image_url, project_url, JSON.stringify(technologies), category, id]
      );
      
      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }
      
      return sendResponse(res, 200, true, 'Portfolio item updated successfully');
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to update portfolio item');
    }
  },

  // Delete portfolio item
  deletePortfolioItem: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute(
        'DELETE FROM portfolio_items WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }
      
      return sendResponse(res, 200, true, 'Portfolio item deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to delete portfolio item');
    }
  }
};

module.exports = portfolioController; 