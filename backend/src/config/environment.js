const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Environment validation configuration
const environmentConfig = {
  // Required environment variables for all environments
  required: {
    // Database configuration
    DB_HOST: {
      description: 'Database host address',
      validate: value => value && value.length > 0,
    },
    DB_USER: {
      description: 'Database username',
      validate: value => value && value.length > 0,
    },
    DB_PASSWORD: {
      description: 'Database password',
      validate: value => value && value.length > 0,
    },
    DB_NAME: {
      description: 'Database name',
      validate: value => value && value.length > 0,
    },

    // JWT configuration
    JWT_SECRET: {
      description: 'JWT secret key for token signing',
      validate: value => {
        if (!value || value.length < 32) {
          throw new Error('JWT_SECRET must be at least 32 characters long');
        }
        return true;
      },
    },

    // Session configuration
    SESSION_SECRET: {
      description: 'Session secret for express-session',
      validate: value => {
        if (!value || value.length < 32) {
          throw new Error('SESSION_SECRET must be at least 32 characters long');
        }
        return true;
      },
    },
  },

  // Required environment variables for production only
  production: {
    ALLOWED_ORIGINS: {
      description: 'Comma-separated list of allowed CORS origins',
      validate: value => {
        if (!value || value.length === 0) {
          throw new Error('ALLOWED_ORIGINS is required in production');
        }
        const origins = value.split(',').map(origin => origin.trim());
        if (origins.length === 0) {
          throw new Error('ALLOWED_ORIGINS must contain at least one origin');
        }
        return true;
      },
    },
  },

  // Optional environment variables with defaults
  optional: {
    NODE_ENV: {
      default: 'development',
      description: 'Application environment',
      validate: value => ['development', 'production', 'test'].includes(value),
    },
    PORT: {
      default: 5000,
      description: 'Server port',
      validate: value => {
        const port = parseInt(value);
        return port > 0 && port <= 65535;
      },
    },
    DB_PORT: {
      default: 3306,
      description: 'Database port',
      validate: value => {
        const port = parseInt(value);
        return port > 0 && port <= 65535;
      },
    },
    EMAIL_HOST: {
      description: 'SMTP host for email service',
      validate: value => !value || value.length > 0,
    },
    EMAIL_PORT: {
      default: 587,
      description: 'SMTP port for email service',
      validate: value => {
        const port = parseInt(value);
        return port > 0 && port <= 65535;
      },
    },
    EMAIL_USER: {
      description: 'SMTP username for email service',
      validate: value => !value || value.length > 0,
    },
    EMAIL_PASSWORD: {
      description: 'SMTP password for email service',
      validate: value => !value || value.length > 0,
    },
    CONTACT_EMAIL: {
      description: 'Contact email address',
      validate: value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    },
    AWS_REGION: {
      default: 'us-east-1',
      description: 'AWS region for S3 and CloudWatch',
      validate: value => value && value.length > 0,
    },
    AWS_ACCESS_KEY_ID: {
      description: 'AWS access key ID for S3 access',
      validate: value => !value || value.length > 0,
    },
    AWS_SECRET_ACCESS_KEY: {
      description: 'AWS secret access key for S3 access',
      validate: value => !value || value.length > 0,
    },
    S3_BUCKET_NAME: {
      default: 'dh-portfolio-assets',
      description: 'S3 bucket name for file storage',
      validate: value => !value || value.length > 0,
    },
    CLOUDFRONT_DOMAIN: {
      description: 'CloudFront distribution domain for CDN',
      validate: value => !value || value.length > 0,
    },
  },
};

// Environment validation function
const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  const config = {};

  const isProduction = process.env.NODE_ENV === 'production';

  // Validate required environment variables
  for (const [key, configItem] of Object.entries(environmentConfig.required)) {
    const value = process.env[key];

    if (!value) {
      errors.push(
        `Missing required environment variable: ${key} - ${configItem.description}`
      );
      continue;
    }

    try {
      configItem.validate(value);
      config[key] = value;
    } catch (error) {
      errors.push(`Invalid environment variable ${key}: ${error.message}`);
    }
  }

  // Validate production-specific environment variables
  if (isProduction) {
    for (const [key, configItem] of Object.entries(
      environmentConfig.production
    )) {
      const value = process.env[key];

      if (!value) {
        errors.push(
          `Missing required environment variable for production: ${key} - ${configItem.description}`
        );
        continue;
      }

      try {
        configItem.validate(value);
        config[key] = value;
      } catch (error) {
        errors.push(`Invalid environment variable ${key}: ${error.message}`);
      }
    }
  }

  // Validate optional environment variables
  for (const [key, configItem] of Object.entries(environmentConfig.optional)) {
    const value = process.env[key] || configItem.default;

    if (value !== undefined) {
      try {
        configItem.validate(value);
        config[key] = value;
      } catch (error) {
        warnings.push(
          `Invalid optional environment variable ${key}: ${error.message}. Using default: ${configItem.default}`
        );
        config[key] = configItem.default;
      }
    } else {
      config[key] = configItem.default;
    }
  }

  // Security checks for production
  if (isProduction) {
    // Check for weak secrets
    if (config.JWT_SECRET && config.JWT_SECRET.length < 64) {
      warnings.push(
        'JWT_SECRET should be at least 64 characters long in production'
      );
    }

    if (config.SESSION_SECRET && config.SESSION_SECRET.length < 64) {
      warnings.push(
        'SESSION_SECRET should be at least 64 characters long in production'
      );
    }

    // Check for common weak secrets
    const weakSecrets = ['secret', 'password', '123456', 'admin', 'test'];
    for (const secret of weakSecrets) {
      if (config.JWT_SECRET === secret || config.SESSION_SECRET === secret) {
        errors.push(
          `Weak secret detected: ${secret} is not allowed in production`
        );
      }
    }

    // Check for development origins in production
    const developmentOrigins = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (config.ALLOWED_ORIGINS) {
      const origins = config.ALLOWED_ORIGINS.split(',').map(origin =>
        origin.trim()
      );
      for (const origin of origins) {
        for (const devOrigin of developmentOrigins) {
          if (origin.includes(devOrigin)) {
            warnings.push(
              `Development origin detected in production ALLOWED_ORIGINS: ${origin}`
            );
          }
        }
      }
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('Environment configuration warnings:');
    warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
  }

  // Throw errors if any
  if (errors.length > 0) {
    console.error('Environment configuration errors:');
    errors.forEach(error => console.error(`  ❌ ${error}`));
    throw new Error(`Environment validation failed: ${errors.length} error(s)`);
  }

  return config;
};

// Get validated environment configuration
const getConfig = () => {
  try {
    return validateEnvironment();
  } catch (error) {
    console.error(
      'Failed to validate environment configuration:',
      error.message
    );
    process.exit(1);
  }
};

// Export configuration and validation function
module.exports = {
  getConfig,
  validateEnvironment,
  environmentConfig,
};
