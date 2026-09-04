const { body, param } = require('express-validator');

/**
 * User Validators - Input validation for user routes
 */

// Signup validation
const signupValidator = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must be no more than 400 characters'),
];

// Submit rating validation
const submitRatingValidator = [
  param('storeId')
    .notEmpty()
    .withMessage('Store ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
];

// Update password validation
const updatePasswordValidator = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
];

module.exports = {
  signupValidator,
  submitRatingValidator,
  updatePasswordValidator,
};
