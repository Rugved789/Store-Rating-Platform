const UserService = require('./userService');
const UserRepository = require('../models/User');
const StoreRepository = require('../models/Store');
const AdminHelper = require('../models/adminHelper');

/**
 * Admin Service - Business logic for admin operations
 */
class AdminService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard data with counts and statistics
   */
  static async getDashboard() {
    try {
      const stats = await AdminHelper.getDashboardStats();
      return stats;
    } catch (error) {
      console.error('Dashboard error:', error.message);
      throw error;
    }
  }

  /**
   * Create new store
   * @param {Object} storeData - Store data
   * @returns {Promise<Object>} Created store
   */
  static async createStore(storeData) {
    const { name, email, address, ownerId } = storeData;

    // Validate required fields
    if (!name || !email || !address || !ownerId) {
      throw new Error('Name, email, address, and ownerId are required');
    }

    // Verify owner exists and is a STORE_OWNER
    const owner = await UserRepository.findById(ownerId);
    if (!owner) {
      throw new Error('Owner user not found');
    }

    if (owner.role !== 'STORE_OWNER' && owner.role !== 'ADMIN') {
      throw new Error('Owner must be a STORE_OWNER or ADMIN user');
    }

    // Create store
    const store = await StoreRepository.create({
      name,
      email,
      address,
      ownerId,
    });

    return store;
  }

  /**
   * Get all stores with pagination, sorting, and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: stores[], total: number }
   */
  static async getStores(options) {
    return AdminHelper.getAllStores(options);
  }

  /**
   * Get store by ID
   * @param {string} storeId - Store ID
   * @returns {Promise<Object>} Store object
   */
  static async getStore(storeId) {
    const store = await StoreRepository.getStoreWithAverageRating(storeId);

    if (!store) {
      throw new Error('Store not found');
    }

    return store;
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async createUser(userData) {
    const { name, email, password, address, role } = userData;

    // Validate required fields
    if (!name || !email || !password || !role) {
      throw new Error('Name, email, password, and role are required');
    }

    // Validate role
    const validRoles = ['USER', 'STORE_OWNER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be USER, STORE_OWNER, or ADMIN');
    }

    // Use UserService to create user (handles password hashing)
    return UserService.createUser({
      name,
      email,
      password,
      address: address || null,
      role,
    });
  }

  /**
   * Get all users with pagination, sorting, and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: users[], total: number }
   */
  static async getUsers(options) {
    return AdminHelper.getAllUsers(options);
  }

  /**
   * Get user by ID with additional info
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object with additional data
   */
  static async getUser(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return UserService.formatUserResponse(user);
  }

  /**
   * Update user password (admin override)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  static async updateUserPassword(userId, newPassword) {
    if (!newPassword) {
      throw new Error('New password is required');
    }

    const passwordHash = await UserService.hashPassword(newPassword);
    const updatedUser = await UserRepository.update(userId, { passwordHash });

    return UserService.formatUserResponse(updatedUser);
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Confirmation
   */
  static async deleteUser(userId) {
    const result = await AdminHelper.deleteUser(userId);
    return { message: 'User deleted successfully', data: result };
  }

  /**
   * Delete store
   * @param {string} storeId - Store ID
   * @returns {Promise<Object>} Confirmation
   */
  static async deleteStore(storeId) {
    const result = await AdminHelper.deleteStore(storeId);
    return { message: 'Store deleted successfully', data: result };
  }
}

module.exports = AdminService;
