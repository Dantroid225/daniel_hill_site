const {
  validateEnvironment,
  environmentConfig,
} = require('../../src/config/environment');

describe('Environment Configuration Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Required Environment Variables', () => {
    test('should throw error when required variables are missing', () => {
      // Clear all required environment variables
      delete process.env.DB_HOST;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;
      delete process.env.JWT_SECRET;
      delete process.env.SESSION_SECRET;

      expect(() => validateEnvironment()).toThrow(
        'Environment validation failed'
      );
    });

    test('should throw error when JWT_SECRET is too short', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'short'; // Less than 32 characters
      process.env.SESSION_SECRET = 'a'.repeat(32);

      expect(() => validateEnvironment()).toThrow(
        'JWT_SECRET must be at least 32 characters long'
      );
    });

    test('should throw error when SESSION_SECRET is too short', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'short'; // Less than 32 characters

      expect(() => validateEnvironment()).toThrow(
        'SESSION_SECRET must be at least 32 characters long'
      );
    });

    test('should pass validation with valid required variables', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);

      const config = validateEnvironment();
      expect(config.DB_HOST).toBe('localhost');
      expect(config.JWT_SECRET).toBe('a'.repeat(32));
      expect(config.SESSION_SECRET).toBe('b'.repeat(32));
    });
  });

  describe('Production Environment Variables', () => {
    test('should require ALLOWED_ORIGINS in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);
      // Missing ALLOWED_ORIGINS

      expect(() => validateEnvironment()).toThrow(
        'ALLOWED_ORIGINS is required in production'
      );
    });

    test('should validate ALLOWED_ORIGINS format in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);
      process.env.ALLOWED_ORIGINS = ''; // Empty string

      expect(() => validateEnvironment()).toThrow(
        'ALLOWED_ORIGINS must contain at least one origin'
      );
    });

    test('should pass production validation with valid ALLOWED_ORIGINS', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);
      process.env.ALLOWED_ORIGINS =
        'https://example.com,https://www.example.com';

      const config = validateEnvironment();
      expect(config.ALLOWED_ORIGINS).toBe(
        'https://example.com,https://www.example.com'
      );
    });
  });

  describe('Optional Environment Variables', () => {
    test('should use default values for optional variables', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);

      const config = validateEnvironment();
      expect(config.NODE_ENV).toBe('development');
      expect(config.PORT).toBe(5000);
      expect(config.DB_PORT).toBe(3306);
      expect(config.AWS_REGION).toBe('us-east-1');
    });

    test('should use provided values for optional variables', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'test';

      const config = validateEnvironment();
      expect(config.PORT).toBe(3000);
      expect(config.NODE_ENV).toBe('test');
    });
  });

  describe('Weak Secret Detection', () => {
    test('should detect weak secrets in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'secret'; // Weak secret
      process.env.SESSION_SECRET = 'b'.repeat(32);
      process.env.ALLOWED_ORIGINS = 'https://example.com';

      expect(() => validateEnvironment()).toThrow(
        'Weak secret detected: secret is not allowed in production'
      );
    });

    test('should allow weak secrets in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'secret'; // Weak secret allowed in development
      process.env.SESSION_SECRET = 'b'.repeat(32);

      const config = validateEnvironment();
      expect(config.JWT_SECRET).toBe('secret');
    });
  });

  describe('Development Origin Detection', () => {
    test('should warn about development origins in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'test';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test_db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);
      process.env.ALLOWED_ORIGINS = 'https://example.com,http://localhost:3000';

      // Should not throw but should log warnings
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      validateEnvironment();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Development origin detected in production ALLOWED_ORIGINS'
        )
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Configuration Structure', () => {
    test('should have correct configuration structure', () => {
      expect(environmentConfig.required).toBeDefined();
      expect(environmentConfig.production).toBeDefined();
      expect(environmentConfig.optional).toBeDefined();

      expect(environmentConfig.required.DB_HOST).toBeDefined();
      expect(environmentConfig.required.JWT_SECRET).toBeDefined();
      expect(environmentConfig.required.SESSION_SECRET).toBeDefined();

      expect(environmentConfig.production.ALLOWED_ORIGINS).toBeDefined();

      expect(environmentConfig.optional.NODE_ENV).toBeDefined();
      expect(environmentConfig.optional.PORT).toBeDefined();
    });
  });
});
