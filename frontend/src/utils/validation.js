/**
 * Validation Utilities
 * Client-side form validation
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 * - 8-16 characters
 * - At least 1 uppercase letter
 * - At least 1 special character (!@#$%^&*)
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (password.length > 16) {
    return { valid: false, error: 'Password must be at most 16 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least 1 uppercase letter' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, error: 'Password must contain at least 1 special character (!@#$%^&*)' };
  }
  return { valid: true };
};

/**
 * Validate name
 * - 2-60 characters
 */
export const validateName = (name) => {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.length > 60) {
    return { valid: false, error: 'Name must be at most 60 characters' };
  }
  return { valid: true };
};

/**
 * Validate passwords match
 */
export const validatePasswordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
};

/**
 * Validate login form
 */
export const validateLoginForm = (email, password) => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  return { valid: true };
};

/**
 * Validate signup form
 */
export const validateSignupForm = (name, email, password, confirmPassword) => {
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  const matchValidation = validatePasswordsMatch(password, confirmPassword);
  if (!matchValidation.valid) {
    return matchValidation;
  }

  return { valid: true };
};
