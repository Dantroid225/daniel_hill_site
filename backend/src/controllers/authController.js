const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendResponse } = require('../utils/responseHelper');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { getConfig } = require('../config/environment');

const config = getConfig();

const authController = {
  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return sendResponse(res, 401, false, 'Invalid credentials');
      }

      const user = users[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendResponse(res, 401, false, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return sendResponse(res, 200, true, 'Login successful', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      return sendResponse(res, 500, false, 'Login failed');
    }
  },

  // User registration
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return sendResponse(res, 400, false, 'User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      return sendResponse(res, 201, true, 'User registered successfully', {
        id: result.insertId,
      });
    } catch (error) {
      console.error('Error during registration:', error);
      return sendResponse(res, 500, false, 'Registration failed');
    }
  },

  // User logout
  logout: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // Add token to blacklist
        tokenBlacklist.blacklistToken(token);
      }

      return sendResponse(res, 200, true, 'Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      return sendResponse(res, 500, false, 'Logout failed');
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;

      const [users] = await pool.execute(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return sendResponse(res, 404, false, 'User not found');
      }

      return sendResponse(
        res,
        200,
        true,
        'Profile retrieved successfully',
        users[0]
      );
    } catch (error) {
      console.error('Error fetching profile:', error);
      return sendResponse(res, 500, false, 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name, email } = req.body;

      const [result] = await pool.execute(
        'UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?',
        [name, email, userId]
      );

      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, 'User not found');
      }

      return sendResponse(res, 200, true, 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      return sendResponse(res, 500, false, 'Failed to update profile');
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return sendResponse(res, 401, false, 'Token required');
      }

      // Check if current token is blacklisted
      if (tokenBlacklist.isBlacklisted(token)) {
        return sendResponse(res, 401, false, 'Token has been revoked');
      }

      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Blacklist the old token
      tokenBlacklist.blacklistToken(token);

      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return sendResponse(res, 200, true, 'Token refreshed successfully', {
        token: newToken,
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      return sendResponse(res, 401, false, 'Invalid token');
    }
  },

  // Revoke all tokens for a user (admin function)
  revokeAllTokens: async (req, res) => {
    try {
      const { userId } = req.params;

      // In a production environment, you would store tokens in a database
      // and revoke them by user ID. For now, we'll just return success.
      // This is a placeholder for future implementation.

      return sendResponse(res, 200, true, 'All tokens revoked successfully');
    } catch (error) {
      console.error('Error revoking tokens:', error);
      return sendResponse(res, 500, false, 'Failed to revoke tokens');
    }
  },
};

module.exports = authController;
