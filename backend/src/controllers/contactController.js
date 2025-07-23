const { pool } = require('../config/database');
const { sendResponse } = require('../utils/responseHelper');

const contactController = {
  // Submit contact form
  submitContactForm: async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      const [result] = await pool.execute(
        'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject, message]
      );
      
      return sendResponse(res, 201, true, 'Contact form submitted successfully', { id: result.insertId });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return sendResponse(res, 500, false, 'Failed to submit contact form');
    }
  },

  // Get all inquiries
  getAllInquiries: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM contact_inquiries ORDER BY created_at DESC'
      );
      return sendResponse(res, 200, true, 'Inquiries retrieved successfully', rows);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return sendResponse(res, 500, false, 'Failed to fetch inquiries');
    }
  },

  // Get inquiry by ID
  getInquiryById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        'SELECT * FROM contact_inquiries WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return sendResponse(res, 404, false, 'Inquiry not found');
      }
      
      return sendResponse(res, 200, true, 'Inquiry retrieved successfully', rows[0]);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      return sendResponse(res, 500, false, 'Failed to fetch inquiry');
    }
  },

  // Update inquiry status
  updateInquiryStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const [result] = await pool.execute(
        'UPDATE contact_inquiries SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
      
      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, 'Inquiry not found');
      }
      
      return sendResponse(res, 200, true, 'Inquiry status updated successfully');
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      return sendResponse(res, 500, false, 'Failed to update inquiry status');
    }
  }
};

module.exports = contactController; 