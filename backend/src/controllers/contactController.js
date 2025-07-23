const { pool } = require("../config/database");
const { sendResponse } = require("../utils/responseHelper");
const { validateContactForm, checkRateLimit } = require("../utils/validation");
const emailService = require("../utils/emailService");

const contactController = {
  // Submit contact form
  submitContactForm: async (req, res) => {
    try {
      // Use sanitized data from validation middleware
      const { name, email, subject, message } = req.sanitizedData || req.body;

      // Rate limiting check
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!checkRateLimit(clientIP, 5, 300000)) {
        // 5 requests per 5 minutes
        return sendResponse(
          res,
          429,
          false,
          "Too many requests. Please try again later."
        );
      }

      // Save to database
      const [result] = await pool.execute(
        "INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)",
        [name, email, subject, message]
      );

      // Send email notification
      try {
        await emailService.sendContactEmail({ name, email, subject, message });

        // Send confirmation email to user
        await emailService.sendConfirmationEmail(email, name);

        return sendResponse(
          res,
          201,
          true,
          "Contact form submitted successfully. You will receive a confirmation email shortly.",
          { id: result.insertId }
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Still return success since the form was saved to database
        return sendResponse(
          res,
          201,
          true,
          "Contact form submitted successfully. Email notification may be delayed.",
          { id: result.insertId }
        );
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return sendResponse(res, 500, false, "Failed to submit contact form");
    }
  },

  // Get all inquiries
  getAllInquiries: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM contact_inquiries ORDER BY created_at DESC"
      );
      return sendResponse(
        res,
        200,
        true,
        "Inquiries retrieved successfully",
        rows
      );
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      return sendResponse(res, 500, false, "Failed to fetch inquiries");
    }
  },

  // Get inquiry by ID
  getInquiryById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        "SELECT * FROM contact_inquiries WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return sendResponse(res, 404, false, "Inquiry not found");
      }

      return sendResponse(
        res,
        200,
        true,
        "Inquiry retrieved successfully",
        rows[0]
      );
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      return sendResponse(res, 500, false, "Failed to fetch inquiry");
    }
  },

  // Update inquiry status
  updateInquiryStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [result] = await pool.execute(
        "UPDATE contact_inquiries SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, "Inquiry not found");
      }

      return sendResponse(
        res,
        200,
        true,
        "Inquiry status updated successfully"
      );
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      return sendResponse(res, 500, false, "Failed to update inquiry status");
    }
  },
};

module.exports = contactController;
