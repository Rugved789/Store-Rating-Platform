const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const AdminController = require('../controllers/adminController');
const { createStoreValidator, createUserValidator } = require('../validators/adminValidators');

const router = express.Router();

/**
 * Admin Routes
 * All routes require admin authentication
 */

// Dashboard
router.get('/dashboard', authMiddleware, requireAdmin, AdminController.getDashboard);

// Store Management
router.get('/stores', authMiddleware, requireAdmin, AdminController.getStores);
router.get('/stores/:storeId', authMiddleware, requireAdmin, AdminController.getStore);
router.post(
  '/stores',
  authMiddleware,
  requireAdmin,
  createStoreValidator,
  validateRequest,
  AdminController.createStore
);
router.delete('/stores/:storeId', authMiddleware, requireAdmin, AdminController.deleteStore);

// User Management
router.get('/users', authMiddleware, requireAdmin, AdminController.getUsers);
router.get('/users/:userId', authMiddleware, requireAdmin, AdminController.getUser);
router.post(
  '/users',
  authMiddleware,
  requireAdmin,
  createUserValidator,
  validateRequest,
  AdminController.createUser
);
router.delete('/users/:userId', authMiddleware, requireAdmin, AdminController.deleteUser);

module.exports = router;
