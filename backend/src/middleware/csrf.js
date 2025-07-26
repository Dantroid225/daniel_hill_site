const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getConfig } = require('../config/environment');

const config = getConfig();

// CSRF token generation and validation middleware
const csrfMiddleware = {
  // Generate CSRF token
  generateToken: (req, res) => {
    console.log('🔄 Generating CSRF token...');

    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Create a signed JWT with the token and timestamp
    const csrfPayload = {
      token,
      timestamp: Date.now(),
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.connection.remoteAddress,
    };

    const signedToken = jwt.sign(csrfPayload, config.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log('✅ CSRF token generated:', {
      token: token.substring(0, 10) + '...',
    });

    // Return the signed token
    res.json({
      success: true,
      csrfToken: signedToken,
    });
  },

  // Validate CSRF token
  validateToken: (req, res, next) => {
    console.log('🔒 CSRF validation for:', req.method, req.path);

    // Skip CSRF validation for GET requests
    if (req.method === 'GET') {
      return next();
    }

    const tokenFromHeader = req.headers['x-csrf-token'];
    const tokenFromBody = req.body._csrf;
    const tokenFromQuery = req.query._csrf;

    const providedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;

    console.log('🔍 CSRF Token Debug:', {
      tokenFromHeader: !!tokenFromHeader,
      tokenFromBody: !!tokenFromBody,
      tokenFromQuery: !!tokenFromQuery,
      providedToken: providedToken ? 'present' : 'none',
    });

    if (!providedToken) {
      console.log('❌ CSRF validation failed: No token provided');
      return res.status(403).json({
        success: false,
        message: 'CSRF token required',
      });
    }

    try {
      // Verify the JWT
      const decoded = jwt.verify(providedToken, config.JWT_SECRET);

      // Check if token is too old (additional security)
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 60 * 60 * 1000) {
        // 1 hour
        console.log('❌ CSRF validation failed: Token too old');
        return res.status(403).json({
          success: false,
          message: 'CSRF token expired',
        });
      }

      // Optional: Check user agent and IP for additional security
      const currentUserAgent = req.headers['user-agent'] || 'unknown';
      const currentIp = req.ip || req.connection.remoteAddress;

      if (decoded.userAgent !== currentUserAgent || decoded.ip !== currentIp) {
        console.log('⚠️ CSRF token user agent/IP mismatch, but proceeding');
        // You can make this stricter by rejecting the request
      }

      console.log('✅ CSRF validation passed');
      next();
    } catch (error) {
      console.log('❌ CSRF validation failed: Invalid token');
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
      });
    }
  },

  // Refresh CSRF token (for AJAX requests)
  refreshToken: (req, res) => {
    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');

    const csrfPayload = {
      token,
      timestamp: Date.now(),
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.connection.remoteAddress,
    };

    const signedToken = jwt.sign(csrfPayload, config.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return new token in response
    res.json({
      success: true,
      csrfToken: signedToken,
    });
  },
};

module.exports = csrfMiddleware;
