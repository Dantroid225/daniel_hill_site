export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

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

  if (!/(?=.*[@$!%*?^&])/.test(password)) {
    errors.push(
      'Password must contain at least one special character (@$!%*?^&)'
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

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const calculatePasswordStrength = (password: string): number => {
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
