const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const { sendResponse } = require("../utils/responseHelper");
const {
  validateEmail,
  validatePassword,
  sanitizeInput,
} = require("../utils/validation");
const User = require("../models/User");

const adminAuthController = {
  // Admin login with secure password verification
  login: async (req, res) => {
    try {
      // Use sanitized data from validation middleware
      const { email, password } = req.sanitizedData || req.body;

      console.log("Admin login attempt for email:", email);

      // Validate input
      if (!email || !password) {
        console.log("Missing email or password");
        return sendResponse(res, 400, false, "Email and password are required");
      }

      // Find admin user by email
      const admin = await User.findAdminByEmail(email);

      if (!admin) {
        console.log("Admin user not found for email:", email);
        return sendResponse(res, 401, false, "Invalid admin credentials");
      }

      console.log("Admin user found:", {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      });

      // Verify password securely
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Invalid password for admin:", email);
        return sendResponse(res, 401, false, "Invalid admin credentials");
      }

      // Generate admin JWT token with role
      const token = jwt.sign(
        {
          userId: admin.id,
          email: admin.email,
          role: "admin",
        },
        process.env.JWT_SECRET || "your-super-secret-jwt-key",
        { expiresIn: "24h" }
      );

      console.log("Admin login successful for:", email);

      return sendResponse(res, 200, true, "Admin login successful", {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      return sendResponse(res, 500, false, "Admin login failed");
    }
  },

  // Admin logout
  logout: async (req, res) => {
    return sendResponse(res, 200, true, "Admin logout successful");
  },

  // Get admin profile
  getProfile: async (req, res) => {
    try {
      const adminId = req.user.userId;

      const admin = await User.findById(adminId);

      if (!admin || admin.role !== "admin") {
        return sendResponse(res, 404, false, "Admin not found");
      }

      return sendResponse(
        res,
        200,
        true,
        "Admin profile retrieved successfully",
        admin
      );
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      return sendResponse(res, 500, false, "Failed to fetch admin profile");
    }
  },

  // Change admin password
  changePassword: async (req, res) => {
    try {
      const adminId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return sendResponse(
          res,
          400,
          false,
          "Current and new password are required"
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await User.verifyPassword(
        adminId,
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return sendResponse(res, 401, false, "Current password is incorrect");
      }

      // Update password
      const success = await User.updatePassword(adminId, newPassword);
      if (!success) {
        return sendResponse(res, 500, false, "Failed to update password");
      }

      return sendResponse(res, 200, true, "Password updated successfully");
    } catch (error) {
      console.error("Error changing admin password:", error);
      return sendResponse(res, 500, false, "Failed to change password");
    }
  },

  // Create new admin (super admin only)
  createAdmin: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return sendResponse(
          res,
          400,
          false,
          "Name, email, and password are required"
        );
      }

      // Check if admin already exists
      const existingAdmin = await User.findAdminByEmail(email);
      if (existingAdmin) {
        return sendResponse(
          res,
          400,
          false,
          "Admin with this email already exists"
        );
      }

      // Create new admin
      const adminId = await User.createAdmin({ name, email, password });

      return sendResponse(res, 201, true, "Admin created successfully", {
        id: adminId,
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      return sendResponse(res, 500, false, "Failed to create admin");
    }
  },
};

module.exports = adminAuthController;
