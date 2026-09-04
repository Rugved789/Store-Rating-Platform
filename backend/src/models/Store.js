const prisma = require('./prismaClient');

/**
 * Store Repository - Data access layer for Store operations
 */
class StoreRepository {
  /**
   * Find store by ID
   * @param {string} id - Store ID
   * @returns {Promise<Object|null>} Store object or null if not found
   */
  static async findById(id) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create new store
   * @param {Object} data - Store data
   * @returns {Promise<Object>} Created store object
   */
  static async create(data) {
    return prisma.store.create({
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update store
   * @param {string} id - Store ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated store object
   */
  static async update(id, data) {
    return prisma.store.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete store
   * @param {string} id - Store ID
   * @returns {Promise<Object>} Deleted store object
   */
  static async delete(id) {
    return prisma.store.delete({
      where: { id },
    });
  }

  /**
   * Find all stores with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: stores[], total: number }
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      name,
      email,
      address,
    } = options;

    const skip = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.store.count({ where }),
    ]);

    // Calculate average rating for each store
    const storesWithRatings = data.map((store) => {
      const avgRating =
        store.ratings.length > 0
          ? (store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(2)
          : null;

      return {
        ...store,
        averageRating: avgRating ? parseFloat(avgRating) : null,
        ratings: undefined, // Remove ratings array from response
      };
    });

    return { data: storesWithRatings, total };
  }

  /**
   * Count stores
   * @returns {Promise<number>} Total store count
   */
  static async count() {
    return prisma.store.count();
  }

  /**
   * Get store with average rating
   * @param {string} storeId - Store ID
   * @returns {Promise<Object>} Store with average rating
   */
  static async getStoreWithAverageRating(storeId) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return null;
    }

    const avgRating =
      store.ratings.length > 0
        ? (store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(2)
        : null;

    return {
      ...store,
      averageRating: avgRating ? parseFloat(avgRating) : null,
      ratings: undefined,
    };
  }
}

module.exports = StoreRepository;
