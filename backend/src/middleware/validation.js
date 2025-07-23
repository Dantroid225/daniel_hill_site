const {
  validateEmail,
  validatePassword,
  validateLength,
  validateUrl,
  sanitizeInput,
  validatePortfolioItem,
  validateContactForm,
  validateUserInput,
} = require("../utils/validation");

// Generic validation middleware factory
const createValidationMiddleware = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    const sanitizedData = {};

    // Apply validation rules
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = req.body[field] || req.query[field] || req.params[field];

      // Required field validation
      if (
        rules.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip further validation if field is not required and empty
      if (!value && !rules.required) {
        continue;
      }

      // Sanitize input
      let sanitizedValue = value;
      if (rules.sanitize !== false) {
        sanitizedValue = sanitizeInput(value);
      }

      // Type validation
      if (rules.type) {
        if (rules.type === "email" && !validateEmail(sanitizedValue)) {
          errors.push(`${field} must be a valid email address`);
        }
        if (rules.type === "url" && !validateUrl(sanitizedValue)) {
          errors.push(`${field} must be a valid URL`);
        }
        if (rules.type === "password") {
          const passwordValidation = validatePassword(sanitizedValue);
          if (!passwordValidation.isValid) {
            errors.push(
              ...passwordValidation.errors.map((err) => `${field}: ${err}`)
            );
          }
        }
      }

      // Length validation
      if (rules.minLength || rules.maxLength) {
        const lengthValidation = validateLength(
          sanitizedValue,
          rules.minLength || 1,
          rules.maxLength || 1000
        );
        if (!lengthValidation) {
          if (rules.minLength && rules.maxLength) {
            errors.push(
              `${field} must be between ${rules.minLength} and ${rules.maxLength} characters`
            );
          } else if (rules.minLength) {
            errors.push(
              `${field} must be at least ${rules.minLength} characters`
            );
          } else if (rules.maxLength) {
            errors.push(
              `${field} must be no more than ${rules.maxLength} characters`
            );
          }
        }
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(sanitizedValue, req);
        if (customResult !== true) {
          errors.push(customResult || `${field} is invalid`);
        }
      }

      // Store sanitized value
      sanitizedData[field] = sanitizedValue;
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Attach sanitized data to request
    req.sanitizedData = sanitizedData;
    next();
  };
};

// Predefined validation rules for common use cases
const validationRules = {
  // Contact form validation
  contactForm: {
    name: { required: true, maxLength: 255, sanitize: true },
    email: { required: true, type: "email", sanitize: true },
    subject: { required: true, maxLength: 255, sanitize: true },
    message: { required: true, maxLength: 5000, sanitize: true },
  },

  // Admin login validation
  adminLogin: {
    email: { required: true, type: "email", sanitize: true },
    password: { required: true, type: "password" },
  },

  // Portfolio item validation
  portfolioItem: {
    title: { required: true, maxLength: 255, sanitize: true },
    description: { required: true, maxLength: 5000, sanitize: true },
    category: { required: true, maxLength: 100, sanitize: true },
    project_url: { required: false, type: "url", sanitize: true },
    technologies: {
      required: true,
      sanitize: false,
      custom: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return "Technologies must be an array with at least one item";
        }
        return true;
      },
    },
    status: {
      required: false,
      sanitize: true,
      custom: (value) => {
        const validStatuses = ["draft", "published", "archived"];
        if (value && !validStatuses.includes(value)) {
          return "Status must be one of: draft, published, archived";
        }
        return true;
      },
    },
    featured: {
      required: false,
      sanitize: false,
      custom: (value) => {
        if (value !== undefined && typeof value !== "boolean") {
          return "Featured must be a boolean value";
        }
        return true;
      },
    },
  },

  // User registration validation
  userRegistration: {
    name: { required: true, maxLength: 255, sanitize: true },
    email: { required: true, type: "email", sanitize: true },
    password: { required: true, type: "password" },
    role: {
      required: false,
      sanitize: true,
      custom: (value) => {
        const validRoles = ["admin", "user"];
        if (value && !validRoles.includes(value)) {
          return "Role must be either admin or user";
        }
        return true;
      },
    },
  },
};

// Export middleware functions
module.exports = {
  createValidationMiddleware,
  validateContactForm: createValidationMiddleware(validationRules.contactForm),
  validateAdminLogin: createValidationMiddleware(validationRules.adminLogin),
  validatePortfolioItem: createValidationMiddleware(
    validationRules.portfolioItem
  ),
  validateUserRegistration: createValidationMiddleware(
    validationRules.userRegistration
  ),
  validationRules,
};
