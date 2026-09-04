const prisma = require('./prismaClient');

/**
 * Rating Repository - Data access layer for Rating operations
 */
class RatingRepository {
  /**
   * Find rating by user and store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @returns {Promise<Object|null>} Rating object or null
   */
  static async findByUserAndStore(userId, storeId) {
    return prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });
  }

  /**
   * Create new rating
   * @param {Object} data - Rating data
   * @returns {Promise<Object>} Created rating
   */
  static async create(data) {
    return prisma.rating.create({
      data,
    });
  }

  /**
   * Update rating
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated rating
   */
  static async update(userId, storeId, data) {
    return prisma.rating.update({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      data,
    });
  }

  /**
   * Upsert rating (create or update)
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise<Object>} Created or updated rating
   */
  static async upsert(userId, storeId, rating) {
    return prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      create: {
        userId,
        storeId,
        rating,
      },
      update: {
        rating,
      },
    });
  }

  /**
   * Get user's rating for a store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @returns {Promise<number|null>} Rating value or null
   */
  static async getUserRatingForStore(userId, storeId) {
    const rating = await this.findByUserAndStore(userId, storeId);
    return rating ? rating.rating : null;
  }

  /**
   * Count ratings by store
   * @param {string} storeId - Store ID
   * @returns {Promise<number>} Total ratings for store
   */
  static async countByStore(storeId) {
    return prisma.rating.count({
      where: { storeId },
    });
  }

  /**
   * Get average rating for store
   * @param {string} storeId - Store ID
   * @returns {Promise<number|null>} Average rating or null
   */
  static async getAverageRating(storeId) {
    const result = await prisma.rating.aggregate({
      where: { storeId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating ? parseFloat(result._avg.rating.toFixed(2)) : null;
  }
}

module.exports = RatingRepository;
