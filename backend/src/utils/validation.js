const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Create a JSDOM window for DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Enhanced input sanitization function using DOMPurify with stricter rules
const sanitizeInput = input => {
  if (typeof input !== 'string') return input;

  // Use DOMPurify for comprehensive XSS protection with stricter settings
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    FORBID_TAGS: [
      'script',
      'style',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'textarea',
      'select',
      'button',
    ],
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
    ],
  });

  // Additional security: remove any remaining potentially dangerous patterns
  return sanitized
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^<]*(?:(?!\/>)<[^<]*)*\/?>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    .replace(/<link\b[^<]*(?:(?!\/>)<[^<]*)*\/?>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!\/>)<[^<]*)*\/?>/gi, '')
    .replace(/<base\b[^<]*(?:(?!\/>)<[^<]*)*\/?>/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/setTimeout\s*\(/gi, '')
    .replace(/setInterval\s*\(/gi, '')
    .replace(/Function\s*\(/gi, '')
    .replace(/document\./gi, '')
    .replace(/window\./gi, '')
    .replace(/location\./gi, '')
    .replace(/history\./gi, '')
    .replace(/localStorage\./gi, '')
    .replace(/sessionStorage\./gi, '')
    .trim();
};

// HTML sanitization for content that needs to preserve some HTML
const sanitizeHTML = input => {
  if (typeof input !== 'string') return input;

  // Allow only safe HTML tags and attributes with stricter rules
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'ol',
      'ul',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'hr',
      'div',
      'span',
    ],
    ALLOWED_ATTR: ['class', 'id'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    FORBID_TAGS: [
      'script',
      'style',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'textarea',
      'select',
      'button',
      'link',
      'meta',
      'base',
    ],
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
      'onkeydown',
      'onkeyup',
      'onkeypress',
    ],
  });

  return sanitized.trim();
};

// Email validation
const validateEmail = email => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

// URL validation
const validateUrl = url => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Input length validation
const validateLength = (input, minLength = 1, maxLength = 1000) => {
  if (!input || typeof input !== 'string') return false;
  return input.length >= minLength && input.length <= maxLength;
};

// Portfolio item validation
const validatePortfolioItem = item => {
  const errors = [];

  // Title validation
  if (!item.title || !validateLength(item.title, 1, 255)) {
    errors.push('Title is required and must be between 1 and 255 characters');
  }

  // Description validation
  if (item.description && !validateLength(item.description, 1, 5000)) {
    errors.push('Description must be between 1 and 5000 characters');
  }

  // Project URL validation
  if (item.project_url && !validateUrl(item.project_url)) {
    errors.push('Project URL must be a valid URL');
  }

  // Technologies validation
  if (item.technologies && !Array.isArray(item.technologies)) {
    errors.push('Technologies must be an array');
  }

  // Category validation
  if (item.category && !validateLength(item.category, 1, 100)) {
    errors.push('Category must be between 1 and 100 characters');
  }

  // Status validation
  const validStatuses = ['draft', 'published', 'archived'];
  if (item.status && !validStatuses.includes(item.status)) {
    errors.push('Status must be one of: draft, published, archived');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Contact form validation
const validateContactForm = form => {
  const errors = [];

  // Name validation
  if (!form.name || !validateLength(form.name, 1, 255)) {
    errors.push('Name is required and must be between 1 and 255 characters');
  }

  // Email validation
  if (!form.email || !validateEmail(form.email)) {
    errors.push('Valid email address is required');
  }

  // Subject validation
  if (!form.subject || !validateLength(form.subject, 1, 255)) {
    errors.push('Subject is required and must be between 1 and 255 characters');
  }

  // Message validation
  if (!form.message || !validateLength(form.message, 1, 5000)) {
    errors.push(
      'Message is required and must be between 1 and 5000 characters'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// User input validation
const validateUserInput = user => {
  const errors = [];

  // Name validation
  if (!user.name || !validateLength(user.name, 1, 255)) {
    errors.push('Name is required and must be between 1 and 255 characters');
  }

  // Email validation
  if (!user.email || !validateEmail(user.email)) {
    errors.push('Valid email address is required');
  }

  // Password validation (for new users)
  if (user.password && !validateLength(user.password, 8, 255)) {
    errors.push('Password must be at least 8 characters long');
  }

  // Role validation
  const validRoles = ['admin', 'user'];
  if (user.role && !validRoles.includes(user.role)) {
    errors.push('Role must be either admin or user');
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
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
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
    const validRequests = requests.filter(timestamp => now - timestamp < 60000);
    if (validRequests.length === 0) {
      rateLimitMap.delete(identifier);
    } else {
      rateLimitMap.set(identifier, validRequests);
    }
  }
}, 60000); // Clean up every minute

// Database input sanitization (fallback to JavaScript implementation)
const sanitizeDatabaseInput = async input => {
  return sanitizeInput(input); // Use enhanced JavaScript sanitization
};

// Database email validation (fallback to JavaScript implementation)
const validateEmailDatabase = async email => {
  return validateEmail(email); // Use JavaScript validation
};

// Enhanced file upload validation with content validation
const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;

  const errors = [];

  if (!file) {
    errors.push('No file provided');
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
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Check file extension
  const fileExtension = file.originalname
    .toLowerCase()
    .substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(
      `File extension not allowed. Allowed extensions: ${allowedExtensions.join(
        ', '
      )}`
    );
  }

  // Content validation - check file magic bytes
  if (file.buffer) {
    const isValidContent = validateFileContent(file.buffer, file.mimetype);
    if (!isValidContent) {
      errors.push('File content does not match the declared file type');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File content validation using magic bytes
const validateFileContent = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) return false;

  const magicBytes = buffer.slice(0, 8);
  const hexString = magicBytes.toString('hex').toUpperCase();

  // Magic bytes for common image formats
  const magicBytesMap = {
    'image/jpeg': ['FFD8FF'],
    'image/png': ['89504E47'],
    'image/gif': ['47494638'],
    'image/webp': ['52494646'], // RIFF header
  };

  const expectedBytes = magicBytesMap[mimetype];
  if (!expectedBytes) return false;

  return expectedBytes.some(bytes => hexString.startsWith(bytes));
};

// Enhanced password validation with common password check
const validatePassword = password => {
  const errors = [];

  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[@$!%*?&^#])/.test(password)) {
    errors.push(
      'Password must contain at least one special character (@$!%*?&^#)'
    );
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeated characters (e.g., aaa, 111)');
  }

  if (/123|abc|qwe|asd|zxc/i.test(password)) {
    errors.push('Password cannot contain common sequences');
  }

  // Check for keyboard patterns
  const keyboardPatterns = [
    'qwerty',
    'asdfgh',
    'zxcvbn',
    '123456',
    '654321',
    'qazwsx',
    'edcrfv',
    'tgbyhn',
    'ujmikl',
    'polkmn',
  ];

  const lowerPassword = password.toLowerCase();
  if (keyboardPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Password cannot contain keyboard patterns');
  }

  // Check password strength score
  const strengthScore = calculatePasswordStrength(password);
  if (strengthScore < 3) {
    errors.push('Password is too weak. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: strengthScore,
  };
};

// Calculate password strength (0-5 scale)
const calculatePasswordStrength = password => {
  let score = 0;

  // Length bonus
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety bonus
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  // Penalties
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 1; // Common sequences

  return Math.max(0, Math.min(5, score));
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
  sanitizeHTML,
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
  validateFileContent,
  calculatePasswordStrength,
};
