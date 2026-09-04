const prisma = require('../models/prismaClient');
const StoreRepository = require('../models/Store');

/**
 * Store Owner Service - Business logic for store owner operations
 */
class StoreOwnerService {
  /**
   * Get store owner's dashboard with their store and ratings
   * @param {string} ownerId - Store owner user ID
   * @returns {Promise<Object>} Dashboard data with store and ratings
   */
  static async getDashboard(ownerId) {
    // Find store owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!store) {
      throw new Error('Store not found for this owner');
    }

    // Calculate average rating
    const avgRating =
      store.ratings.length > 0
        ? (store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(2)
        : null;

    // Format ratings for response
    const formattedRatings = store.ratings.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      },
      averageRating: avgRating ? parseFloat(avgRating) : null,
      totalRatings: store.ratings.length,
      ratings: formattedRatings,
    };
  }

  /**
   * Get store owner's store information
   * @param {string} ownerId - Store owner user ID
   * @returns {Promise<Object>} Store object
   */
  static async getStore(ownerId) {
    const store = await prisma.store.findFirst({
      where: { ownerId },
    });

    if (!store) {
      throw new Error('Store not found for this owner');
    }

    return store;
  }

  /**
   * Get paginated ratings for store owner's store
   * @param {string} ownerId - Store owner user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: ratings[], total: number }
   */
  static async getRatings(ownerId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const skip = (page - 1) * limit;

    // Get store first
    const store = await prisma.store.findFirst({
      where: { ownerId },
    });

    if (!store) {
      throw new Error('Store not found for this owner');
    }

    // Get paginated ratings for this store
    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { storeId: store.id },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.rating.count({
        where: { storeId: store.id },
      }),
    ]);

    // Format ratings
    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return { data: formattedRatings, total };
  }

  /**
   * Get store owner's store statistics
   * @param {string} ownerId - Store owner user ID
   * @returns {Promise<Object>} Store statistics
   */
  static async getStatistics(ownerId) {
    // Get store first
    const store = await prisma.store.findFirst({
      where: { ownerId },
    });

    if (!store) {
      throw new Error('Store not found for this owner');
    }

    // Get statistics
    const [totalRatings, avgRating, ratingDistribution] = await Promise.all([
      prisma.rating.count({
        where: { storeId: store.id },
      }),
      prisma.rating.aggregate({
        where: { storeId: store.id },
        _avg: {
          rating: true,
        },
      }),
      // Get count of each rating (1-5)
      Promise.all([1, 2, 3, 4, 5].map((rating) =>
        prisma.rating.count({
          where: {
            storeId: store.id,
            rating,
          },
        })
      )),
    ]);

    return {
      totalRatings,
      averageRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(2)) : null,
      ratingDistribution: {
        '1': ratingDistribution[0],
        '2': ratingDistribution[1],
        '3': ratingDistribution[2],
        '4': ratingDistribution[3],
        '5': ratingDistribution[4],
      },
    };
  }
}

module.exports = StoreOwnerService;
