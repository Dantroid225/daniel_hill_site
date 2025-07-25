const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHelper');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendResponse(res, 401, false, 'Access token required');
  }

  if (!process.env.JWT_SECRET) {
    return sendResponse(
      res,
      500,
      false,
      'JWT_SECRET environment variable is required'
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return sendResponse(res, 403, false, 'Invalid or expired token');
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
