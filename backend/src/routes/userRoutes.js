const express = require('express');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const UserController = require('../controllers/userController');
const {
  signupValidator,
  submitRatingValidator,
  updatePasswordValidator,
} = require('../validators/userValidators');

const router = express.Router();

/**
 * User Routes
 */

// Public routes (no auth required)
router.post(
  '/auth/signup',
  signupValidator,
  validateRequest,
  UserController.signup
);

// Protected routes (auth required)
router.get('/stores', authMiddleware, UserController.getStores);
router.post(
  '/stores/:storeId/ratings',
  authMiddleware,
  submitRatingValidator,
  validateRequest,
  UserController.submitRating
);
router.post(
  '/auth/update-password',
  authMiddleware,
  updatePasswordValidator,
  validateRequest,
  UserController.updatePassword
);
router.get('/auth/profile', authMiddleware, UserController.getProfile);

module.exports = router;
