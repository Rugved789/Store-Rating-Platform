const { body } = require('express-validator');

/**
 * Admin Validators - Input validation for admin routes
 */

// Store creation validation
const createStoreValidator = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must be no more than 400 characters'),
  body('ownerId')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isLength({ min: 1 })
    .withMessage('Invalid owner ID'),
];

// User creation validation
const createUserValidator = [
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
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['USER', 'STORE_OWNER', 'ADMIN'])
    .withMessage('Role must be USER, STORE_OWNER, or ADMIN'),
];

module.exports = {
  createStoreValidator,
  createUserValidator,
};
