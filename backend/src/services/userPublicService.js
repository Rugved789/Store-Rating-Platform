const UserService = require('./userService');
const StoreRepository = require('../models/Store');
const RatingRepository = require('../models/Rating');
const StoresHelper = require('../models/storesHelper');

/**
 * User Public Service - Business logic for normal user operations
 */
class UserPublicService {
  /**
   * Signup new user (self-registration)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  static async signup(userData) {
    const { name, email, address, password } = userData;

    // Validate required fields
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    // Use UserService to create user
    return UserService.createUser({
      name,
      email,
      password,
      address: address || null,
      role: 'USER', // Always create as normal user
    });
  }

  /**
   * Get all stores with pagination, sorting, filtering, and user's ratings
   * @param {string} userId - Current user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: stores[], total: number }
   */
  static async getStoresWithRatings(userId, options = {}) {
    // Use direct database helper to bypass adapter issues
    return StoresHelper.getStoresWithRatings(userId, options);
  }

  /**
   * Submit or update rating for a store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise<Object>} Created or updated rating
   */
  static async submitRating(userId, storeId, rating) {
    // Validate rating value
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    // Verify store exists
    const store = await StoreRepository.findById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Upsert rating (create if new, update if exists)
    const result = await RatingRepository.upsert(userId, storeId, rating);

    return {
      id: result.id,
      userId: result.userId,
      storeId: result.storeId,
      rating: result.rating,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * Get user's rating for a store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @returns {Promise<Object|null>} Rating object or null
   */
  static async getUserRating(userId, storeId) {
    const rating = await RatingRepository.findByUserAndStore(userId, storeId);
    return rating || null;
  }

  /**
   * Update user password (for authenticated users)
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user (without password)
   */
  static async updatePassword(userId, oldPassword, newPassword) {
    return UserService.updatePassword(userId, oldPassword, newPassword);
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data (without password)
   */
  static async getCurrentUser(userId) {
    return UserService.getUserById(userId);
  }
}

module.exports = UserPublicService;
