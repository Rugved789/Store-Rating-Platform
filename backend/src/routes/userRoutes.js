const express = require('express');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const UserController = require('../controllers/userController');
const {
  submitRatingValidator,
  updatePasswordValidator,
} = require('../validators/userValidators');

const router = express.Router();

/**
 * User Routes
 * Mounted at /auth, so these become /auth/stores, /auth/update-password, /auth/profile, etc.
 */

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
  '/update-password',
  authMiddleware,
  updatePasswordValidator,
  validateRequest,
  UserController.updatePassword
);
router.get('/profile', authMiddleware, UserController.getProfile);

module.exports = router;
