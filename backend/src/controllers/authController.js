const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendResponse } = require('../utils/responseHelper');

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

      if (!process.env.JWT_SECRET) {
        return sendResponse(
          res,
          500,
          false,
          'JWT_SECRET environment variable is required'
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
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
    // JWT tokens are stateless, so we just return success
    // In a real application, you might want to implement token blacklisting
    return sendResponse(res, 200, true, 'Logout successful');
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

      if (!process.env.JWT_SECRET) {
        return sendResponse(
          res,
          500,
          false,
          'JWT_SECRET environment variable is required'
        );
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET,
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
};

module.exports = authController;
