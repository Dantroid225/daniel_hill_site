const {
  validateEmail,
  validatePassword,
  validateLength,
  validateUrl,
  sanitizeInput,
  sanitizeHTML,
  validatePortfolioItem,
  validateContactForm,
  validateUserInput,
} = require('../utils/validation');

// Generic validation middleware factory
const createValidationMiddleware = validationRules => {
  return (req, res, next) => {
    console.log('🔍 Validation middleware called for:', req.path);
    console.log('📝 Request body:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password?.length,
    });

    const errors = [];
    const sanitizedData = {};

    // Apply validation rules
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = req.body[field] || req.query[field] || req.params[field];

      console.log(`🔍 Validating field '${field}':`, {
        hasValue: !!value,
        valueLength: value?.length,
        rules,
      });

      // Required field validation
      if (
        rules.required &&
        (!value || (typeof value === 'string' && !value.trim()))
      ) {
        errors.push(`${field} is required`);
        console.log(`❌ Field '${field}' is required but missing or empty`);
        continue;
      }

      // Skip further validation if field is not required and empty
      if (!value && !rules.required) {
        continue;
      }

      // Sanitize input based on rules
      let sanitizedValue = value;
      if (rules.sanitize !== false) {
        if (rules.allowHTML) {
          sanitizedValue = sanitizeHTML(value);
        } else {
          sanitizedValue = sanitizeInput(value);
        }
      }

      // Pre-parse values for specific fields before validation
      if (field === 'technologies' && typeof sanitizedValue === 'string') {
        try {
          sanitizedValue = JSON.parse(sanitizedValue);
        } catch (error) {
          errors.push('Technologies must be a valid JSON array');
          console.log(`❌ Field '${field}' JSON parsing failed`);
          continue;
        }
      }

      if (field === 'featured') {
        // Handle featured field conversion - FormData sends '0' for false, '1' for true
        console.log(`🔍 Featured field debug - Original value:`, {
          value: sanitizedValue,
          type: typeof sanitizedValue,
          length: sanitizedValue?.length,
        });

        if (typeof sanitizedValue === 'string') {
          if (sanitizedValue === 'true' || sanitizedValue === '1') {
            sanitizedValue = true;
            console.log(`✅ Featured converted to true`);
          } else if (sanitizedValue === 'false' || sanitizedValue === '0') {
            sanitizedValue = false;
            console.log(`✅ Featured converted to false`);
          }
        }
        // If already boolean, no conversion needed

        console.log(`🔍 Featured field debug - After conversion:`, {
          value: sanitizedValue,
          type: typeof sanitizedValue,
        });
      }

      // Type validation
      if (rules.type) {
        if (rules.type === 'email' && !validateEmail(sanitizedValue)) {
          errors.push(`${field} must be a valid email address`);
          console.log(`❌ Field '${field}' email validation failed`);
        }
        if (rules.type === 'url' && !validateUrl(sanitizedValue)) {
          errors.push(`${field} must be a valid URL`);
          console.log(`❌ Field '${field}' URL validation failed`);
        }
        if (rules.type === 'password') {
          const passwordValidation = validatePassword(sanitizedValue);
          if (!passwordValidation.isValid) {
            console.log(
              `❌ Field '${field}' password validation failed:`,
              passwordValidation.errors
            );
            errors.push(
              ...passwordValidation.errors.map(err => `${field}: ${err}`)
            );
          } else {
            console.log(`✅ Field '${field}' password validation passed`);
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
          console.log(`❌ Field '${field}' length validation failed`);
        }
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(sanitizedValue, req);
        if (customResult !== true) {
          errors.push(customResult || `${field} is invalid`);
          console.log(
            `❌ Field '${field}' custom validation failed:`,
            customResult
          );
        }
      }

      // Store sanitized value
      sanitizedData[field] = sanitizedValue;
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      console.log('❌ Validation failed with errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
      });
    }

    console.log('✅ Validation passed, proceeding to controller');
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
    email: { required: true, type: 'email', sanitize: true },
    subject: { required: true, maxLength: 255, sanitize: true },
    message: { required: true, maxLength: 5000, sanitize: true },
  },

  // Admin login validation
  adminLogin: {
    email: { required: true, type: 'email', sanitize: true },
    password: { required: true, type: 'password' },
  },

  // Portfolio item validation
  portfolioItem: {
    title: { required: true, maxLength: 255, sanitize: true },
    description: {
      required: true,
      maxLength: 5000,
      sanitize: true,
      allowHTML: true,
    },
    category: { required: true, maxLength: 100, sanitize: true },
    project_url: { required: false, type: 'url', sanitize: true },
    technologies: {
      required: true,
      sanitize: false,
      custom: value => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Technologies must be an array with at least one item';
        }

        // Sanitize each technology item
        if (Array.isArray(value)) {
          value.forEach((tech, index) => {
            if (typeof tech === 'string') {
              value[index] = sanitizeInput(tech);
            }
          });
        }
        return true;
      },
    },
    status: {
      required: false,
      sanitize: true,
      custom: value => {
        const validStatuses = ['draft', 'published', 'archived'];
        if (value && !validStatuses.includes(value)) {
          return 'Status must be one of: draft, published, archived';
        }
        return true;
      },
    },
    featured: {
      required: false,
      sanitize: false,
      custom: value => {
        if (
          value !== undefined &&
          value !== null &&
          typeof value !== 'boolean'
        ) {
          return 'Featured must be a boolean value';
        }
        return true;
      },
    },
  },

  // User registration validation
  userRegistration: {
    name: { required: true, maxLength: 255, sanitize: true },
    email: { required: true, type: 'email', sanitize: true },
    password: { required: true, type: 'password' },
    role: {
      required: false,
      sanitize: true,
      custom: value => {
        const validRoles = ['admin', 'user'];
        if (value && !validRoles.includes(value)) {
          return 'Role must be either admin or user';
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
