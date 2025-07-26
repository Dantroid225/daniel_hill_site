const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendResponse } = require('../utils/responseHelper');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { getConfig } = require('../config/environment');

const config = getConfig();

const adminAuthController = {
  // Admin login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log('🔍 Admin login attempt:', {
        email,
        passwordLength: password?.length,
      });

      // Find admin by email
      const [admins] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND role = "admin"',
        [email]
      );

      console.log('📊 Database query result:', {
        foundAdmins: admins.length,
        adminExists: admins.length > 0,
      });

      if (admins.length === 0) {
        console.log('❌ No admin user found with email:', email);
        return sendResponse(res, 401, false, 'Invalid admin credentials');
      }

      const admin = admins[0];
      console.log('✅ Admin user found:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        hasPassword: !!admin.password,
      });

      // Check password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log('🔐 Password validation result:', {
        isPasswordValid,
        providedPasswordLength: password?.length,
        storedPasswordHash: admin.password?.substring(0, 20) + '...',
      });

      if (!isPasswordValid) {
        console.log('❌ Password validation failed for admin:', email);
        return sendResponse(res, 401, false, 'Invalid admin credentials');
      }

      console.log('✅ Password validation successful for admin:', email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: admin.id, email: admin.email, role: 'admin' },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('🎉 Admin login successful:', {
        email,
        tokenGenerated: !!token,
      });

      return sendResponse(res, 200, true, 'Admin login successful', {
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error('💥 Error during admin login:', error);
      return sendResponse(res, 500, false, 'Admin login failed');
    }
  },

  // Admin logout
  logout: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // Add token to blacklist
        tokenBlacklist.blacklistToken(token);
      }

      return sendResponse(res, 200, true, 'Admin logout successful');
    } catch (error) {
      console.error('Error during admin logout:', error);
      return sendResponse(res, 500, false, 'Admin logout failed');
    }
  },

  // Get admin profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;

      const [admins] = await pool.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ? AND role = "admin"',
        [userId]
      );

      if (admins.length === 0) {
        return sendResponse(res, 404, false, 'Admin not found');
      }

      return sendResponse(
        res,
        200,
        true,
        'Admin profile retrieved successfully',
        admins[0]
      );
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      return sendResponse(res, 500, false, 'Failed to fetch admin profile');
    }
  },

  // Change admin password
  changePassword: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      // Get current admin
      const [admins] = await pool.execute(
        'SELECT password FROM users WHERE id = ? AND role = "admin"',
        [userId]
      );

      if (admins.length === 0) {
        return sendResponse(res, 404, false, 'Admin not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        admins[0].password
      );

      if (!isCurrentPasswordValid) {
        return sendResponse(res, 400, false, 'Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await pool.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, userId]
      );

      return sendResponse(res, 200, true, 'Password changed successfully');
    } catch (error) {
      console.error('Error changing admin password:', error);
      return sendResponse(res, 500, false, 'Failed to change password');
    }
  },

  // Create new admin
  createAdmin: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if admin already exists
      const [existingAdmins] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingAdmins.length > 0) {
        return sendResponse(res, 400, false, 'Admin already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "admin")',
        [name, email, hashedPassword]
      );

      return sendResponse(res, 201, true, 'Admin created successfully', {
        id: result.insertId,
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      return sendResponse(res, 500, false, 'Failed to create admin');
    }
  },
};

module.exports = adminAuthController;
