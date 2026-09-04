const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { signupValidator } = require('../validators/userValidators');

const router = express.Router();

/**
 * Authentication Routes
 */

// Public routes (no auth required)
router.post('/signup', signupValidator, validateRequest, AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes (auth required)
router.get('/me', authMiddleware, AuthController.getCurrentUser);

module.exports = router;
