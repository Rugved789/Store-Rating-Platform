const AdminService = require('../services/adminService');

/**
 * Admin Controller - Handle admin operations
 */
class AdminController {
  /**
   * Get admin dashboard
   * GET /admin/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const dashboard = await AdminService.getDashboard();

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
   * Get all stores with pagination, sorting, and filtering
   * GET /admin/stores
   */
  static async getStores(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', name, email, address } = req.query;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Validate sort order
      const order = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const result = await AdminService.getStores({
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy || 'createdAt',
        sortOrder: order,
        name: name || undefined,
        email: email || undefined,
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
   * Get store by ID
   * GET /admin/stores/:storeId
   */
  static async getStore(req, res, next) {
    try {
      const { storeId } = req.params;

      const store = await AdminService.getStore(storeId);

      return res.status(200).json({
        success: true,
        data: { store },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new store
   * POST /admin/stores
   */
  static async createStore(req, res, next) {
    try {
      const { name, email, address, ownerId } = req.body;

      const store = await AdminService.createStore({
        name,
        email,
        address,
        ownerId,
      });

      return res.status(201).json({
        success: true,
        data: { store },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete store
   * DELETE /admin/stores/:storeId
   */
  static async deleteStore(req, res, next) {
    try {
      const { storeId } = req.params;

      const result = await AdminService.deleteStore(storeId);

      return res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with pagination, sorting, and filtering
   * GET /admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', name, email, role } = req.query;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Validate sort order
      const order = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const result = await AdminService.getUsers({
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy || 'createdAt',
        sortOrder: order,
        name: name || undefined,
        email: email || undefined,
        role: role || undefined,
      });

      return res.status(200).json({
        success: true,
        data: {
          users: result.data,
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
   * Get user by ID
   * GET /admin/users/:userId
   */
  static async getUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await AdminService.getUser(userId);

      return res.status(200).json({
        success: true,
        data: { user },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   * POST /admin/users
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, address, role } = req.body;

      const user = await AdminService.createUser({
        name,
        email,
        password,
        address,
        role,
      });

      return res.status(201).json({
        success: true,
        data: { user },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /admin/users/:userId
   */
  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await AdminService.deleteUser(userId);

      return res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
