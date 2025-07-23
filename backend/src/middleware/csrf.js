const crypto = require("crypto");

// CSRF token generation and validation middleware
const csrfMiddleware = {
  // Generate CSRF token
  generateToken: (req, res, next) => {
    if (!req.session) {
      return res.status(500).json({
        success: false,
        message: "Session not available",
      });
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token in session
    req.session.csrfToken = token;

    // Add token to response headers for frontend access
    res.setHeader("X-CSRF-Token", token);

    next();
  },

  // Validate CSRF token
  validateToken: (req, res, next) => {
    // Skip CSRF validation for GET requests
    if (req.method === "GET") {
      return next();
    }

    if (!req.session) {
      return res.status(500).json({
        success: false,
        message: "Session not available",
      });
    }

    const tokenFromHeader = req.headers["x-csrf-token"];
    const tokenFromBody = req.body._csrf;
    const tokenFromQuery = req.query._csrf;

    const providedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;
    const sessionToken = req.session.csrfToken;

    if (!providedToken || !sessionToken || providedToken !== sessionToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid CSRF token",
      });
    }

    // Token is valid, proceed
    next();
  },

  // Refresh CSRF token (for AJAX requests)
  refreshToken: (req, res, next) => {
    if (!req.session) {
      return res.status(500).json({
        success: false,
        message: "Session not available",
      });
    }

    // Generate new token
    const newToken = crypto.randomBytes(32).toString("hex");
    req.session.csrfToken = newToken;

    // Return new token in response
    res.json({
      success: true,
      csrfToken: newToken,
    });
  },
};

module.exports = csrfMiddleware;
