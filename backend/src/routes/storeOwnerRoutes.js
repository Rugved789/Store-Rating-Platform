const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireStoreOwner } = require('../middleware/rbac');
const StoreOwnerController = require('../controllers/storeOwnerController');

const router = express.Router();

/**
 * Store Owner Routes
 * All routes require STORE_OWNER authentication
 */

// Dashboard and statistics
router.get('/dashboard', authMiddleware, requireStoreOwner, StoreOwnerController.getDashboard);
router.get('/statistics', authMiddleware, requireStoreOwner, StoreOwnerController.getStatistics);

// Store information
router.get('/store', authMiddleware, requireStoreOwner, StoreOwnerController.getStore);

// Ratings
router.get('/ratings', authMiddleware, requireStoreOwner, StoreOwnerController.getRatings);

module.exports = router;
