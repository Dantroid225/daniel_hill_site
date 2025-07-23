const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHelper');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return sendResponse(res, 401, false, 'Access token required');
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key', (err, user) => {
    if (err) {
      return sendResponse(res, 403, false, 'Invalid or expired token');
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken }; 