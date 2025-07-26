const jwt = require('jsonwebtoken');

// In-memory blacklist (in production, use Redis or database)
const blacklistedTokens = new Set();

// Token blacklist service
const tokenBlacklist = {
  // Add token to blacklist
  blacklistToken: token => {
    if (token) {
      blacklistedTokens.add(token);
    }
  },

  // Check if token is blacklisted
  isBlacklisted: token => {
    return blacklistedTokens.has(token);
  },

  // Remove expired tokens from blacklist
  cleanupExpiredTokens: () => {
    const now = Date.now();
    for (const token of blacklistedTokens) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp && decoded.exp * 1000 < now) {
          blacklistedTokens.delete(token);
        }
      } catch (error) {
        // If token is invalid, remove it from blacklist
        blacklistedTokens.delete(token);
      }
    }
  },

  // Get blacklist size (for monitoring)
  getBlacklistSize: () => {
    return blacklistedTokens.size;
  },

  // Clear entire blacklist (use with caution)
  clearBlacklist: () => {
    blacklistedTokens.clear();
  },
};

// Clean up expired tokens every hour
setInterval(() => {
  tokenBlacklist.cleanupExpiredTokens();
}, 60 * 60 * 1000); // 1 hour

module.exports = tokenBlacklist;
