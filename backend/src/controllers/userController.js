const UserPublicService = require('../services/userPublicService');

/**
 * User Controller - Handle user operations
 */
class UserController {
  /**
   * User signup
   * POST /auth/signup
   */
  static async signup(req, res, next) {
    try {
      const { name, email, address, password } = req.body;

      const user = await UserPublicService.signup({
        name,
        email,
        address,
        password,
      });

      return res.status(201).json({
        success: true,
        data: {
          user,
          message: 'User created successfully. Please login.',
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all stores with pagination, sorting, and user's ratings
   * GET /stores
   */
  static async getStores(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, name, address } = req.query;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Validate sort order
      const order = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const result = await UserPublicService.getStoresWithRatings(req.user.userId, {
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy || 'createdAt',
        sortOrder: order,
        search: search || undefined,
        name: name || undefined,
        address: address || undefined,
      });

      return res.status(200).json({
        success: true,
        data: {
          stores: result.data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: result.total,
            pages: Math.ceil(result.total / limitNum),
          },
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit or update rating for a store
   * POST /stores/:storeId/ratings
   */
  static async submitRating(req, res, next) {
    try {
      const { storeId } = req.params;
      const { rating } = req.body;

      const result = await UserPublicService.submitRating(req.user.userId, storeId, rating);

      // Always return 200 for simplicity - frontend can handle both create and update as success
      return res.status(200).json({
        success: true,
        data: {
          rating: result,
          message: 'Rating submitted successfully',
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user password
   * POST /auth/update-password
   */
  static async updatePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await UserPublicService.updatePassword(req.user.userId, oldPassword, newPassword);

      return res.status(200).json({
        success: true,
        data: {
          user,
          message: 'Password updated successfully',
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await UserPublicService.getCurrentUser(req.user.userId);

      return res.status(200).json({
        success: true,
        data: { user },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
