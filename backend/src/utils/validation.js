const { pool } = require("../config/database");

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .trim();
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

// URL validation
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Input length validation
const validateLength = (input, minLength = 1, maxLength = 1000) => {
  if (!input || typeof input !== "string") return false;
  return input.length >= minLength && input.length <= maxLength;
};

// Portfolio item validation
const validatePortfolioItem = (item) => {
  const errors = [];

  // Title validation
  if (!item.title || !validateLength(item.title, 1, 255)) {
    errors.push("Title is required and must be between 1 and 255 characters");
  }

  // Description validation
  if (item.description && !validateLength(item.description, 1, 5000)) {
    errors.push("Description must be between 1 and 5000 characters");
  }

  // Project URL validation
  if (item.project_url && !validateUrl(item.project_url)) {
    errors.push("Project URL must be a valid URL");
  }

  // Technologies validation
  if (item.technologies && !Array.isArray(item.technologies)) {
    errors.push("Technologies must be an array");
  }

  // Category validation
  if (item.category && !validateLength(item.category, 1, 100)) {
    errors.push("Category must be between 1 and 100 characters");
  }

  // Status validation
  const validStatuses = ["draft", "published", "archived"];
  if (item.status && !validStatuses.includes(item.status)) {
    errors.push("Status must be one of: draft, published, archived");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Contact form validation
const validateContactForm = (form) => {
  const errors = [];

  // Name validation
  if (!form.name || !validateLength(form.name, 1, 255)) {
    errors.push("Name is required and must be between 1 and 255 characters");
  }

  // Email validation
  if (!form.email || !validateEmail(form.email)) {
    errors.push("Valid email address is required");
  }

  // Subject validation
  if (!form.subject || !validateLength(form.subject, 1, 255)) {
    errors.push("Subject is required and must be between 1 and 255 characters");
  }

  // Message validation
  if (!form.message || !validateLength(form.message, 1, 5000)) {
    errors.push(
      "Message is required and must be between 1 and 5000 characters"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// User input validation
const validateUserInput = (user) => {
  const errors = [];

  // Name validation
  if (!user.name || !validateLength(user.name, 1, 255)) {
    errors.push("Name is required and must be between 1 and 255 characters");
  }

  // Email validation
  if (!user.email || !validateEmail(user.email)) {
    errors.push("Valid email address is required");
  }

  // Password validation (for new users)
  if (user.password && !validateLength(user.password, 8, 255)) {
    errors.push("Password must be at least 8 characters long");
  }

  // Role validation
  const validRoles = ["admin", "user"];
  if (user.role && !validRoles.includes(user.role)) {
    errors.push("Role must be either admin or user");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting check (simple in-memory implementation)
const rateLimitMap = new Map();

const checkRateLimit = (identifier, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }

  const requests = rateLimitMap.get(identifier);

  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp) => timestamp > windowStart);
  rateLimitMap.set(identifier, validRequests);

  // Check if limit exceeded
  if (validRequests.length >= maxRequests) {
    return false;
  }

  // Add current request
  validRequests.push(now);
  return true;
};

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [identifier, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < 60000
    );
    if (validRequests.length === 0) {
      rateLimitMap.delete(identifier);
    } else {
      rateLimitMap.set(identifier, validRequests);
    }
  }
}, 60000); // Clean up every minute

// Database input sanitization (fallback to JavaScript implementation)
const sanitizeDatabaseInput = async (input) => {
  return sanitizeInput(input); // Use JavaScript sanitization
};

// Database email validation (fallback to JavaScript implementation)
const validateEmailDatabase = async (email) => {
  return validateEmail(email); // Use JavaScript validation
};

// File upload validation
const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  } = options;

  const errors = [];

  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    );
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(
      `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  // Check file extension
  const fileExtension = file.originalname
    .toLowerCase()
    .substring(file.originalname.lastIndexOf("."));
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(
      `File extension not allowed. Allowed extensions: ${allowedExtensions.join(
        ", "
      )}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Enhanced password validation
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// CSRF token validation
const validateCSRFToken = (token, sessionToken) => {
  if (!token || !sessionToken) {
    return false;
  }
  return token === sessionToken;
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validateUrl,
  validateLength,
  validatePortfolioItem,
  validateContactForm,
  validateUserInput,
  validateFileUpload,
  validatePassword,
  validateCSRFToken,
  checkRateLimit,
  sanitizeDatabaseInput,
  validateEmailDatabase,
};
