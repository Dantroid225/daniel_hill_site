const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHelper');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { getConfig } = require('../config/environment');

const config = getConfig();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendResponse(res, 401, false, 'Access token required');
  }

  // Check if token is blacklisted
  if (tokenBlacklist.isBlacklisted(token)) {
    return sendResponse(res, 401, false, 'Token has been revoked');
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return sendResponse(res, 403, false, 'Invalid or expired token');
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
