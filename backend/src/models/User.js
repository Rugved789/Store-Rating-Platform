const prisma = require('./prismaClient');

/**
 * User Repository - Data access layer for User operations
 */
class UserRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create new user
   * @param {Object} data - User data
   * @returns {Promise<Object>} Created user object
   */
  static async create(data) {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated user object
   */
  static async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  static async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Find all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: users[], total: number }
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      name,
      email,
      role,
    } = options;

    const skip = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (role) {
      where.role = role;
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Count users
   * @returns {Promise<number>} Total user count
   */
  static async count() {
    return prisma.user.count();
  }
}

module.exports = UserRepository;
