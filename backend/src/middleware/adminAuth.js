const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHelper');
const User = require('../models/User');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { getConfig } = require('../config/environment');

const config = getConfig();

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendResponse(res, 401, false, 'Admin access token required');
  }

  // Check if token is blacklisted
  if (tokenBlacklist.isBlacklisted(token)) {
    return sendResponse(res, 401, false, 'Token has been revoked');
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Verify user exists and is admin
    const isAdmin = await User.isAdmin(decoded.userId);
    if (!isAdmin) {
      return sendResponse(res, 403, false, 'Admin access required');
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return sendResponse(res, 403, false, 'Invalid or expired admin token');
  }
};

// Optional admin middleware for routes that can be accessed by both admin and regular users
const optionalAdminAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without authentication
  }

  // Check if token is blacklisted
  if (tokenBlacklist.isBlacklisted(token)) {
    return next(); // Continue without authentication
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const isAdmin = await User.isAdmin(decoded.userId);
    if (isAdmin) {
      req.user = decoded;
      req.isAdmin = true;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = { authenticateAdmin, optionalAdminAuth };
