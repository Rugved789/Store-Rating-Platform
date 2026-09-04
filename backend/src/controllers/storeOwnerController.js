const StoreOwnerService = require('../services/storeOwnerService');

/**
 * Store Owner Controller - Handle store owner operations
 */
class StoreOwnerController {
  /**
   * Get store owner's dashboard
   * GET /store-owner/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const dashboard = await StoreOwnerService.getDashboard(req.user.userId);

      return res.status(200).json({
        success: true,
        data: {
          dashboard,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get store owner's ratings with pagination
   * GET /store-owner/ratings
   */
  static async getRatings(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Validate sort order
      const order = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const result = await StoreOwnerService.getRatings(req.user.userId, {
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy || 'createdAt',
        sortOrder: order,
      });

      return res.status(200).json({
        success: true,
        data: {
          ratings: result.data,
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
   * Get store owner's store statistics
   * GET /store-owner/statistics
   */
  static async getStatistics(req, res, next) {
    try {
      const statistics = await StoreOwnerService.getStatistics(req.user.userId);

      return res.status(200).json({
        success: true,
        data: {
          statistics,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get store owner's store
   * GET /store-owner/store
   */
  static async getStore(req, res, next) {
    try {
      const store = await StoreOwnerService.getStore(req.user.userId);

      return res.status(200).json({
        success: true,
        data: {
          store,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StoreOwnerController;
