const prisma = require('./prismaClient');
const prismaClientDirect = require('./prismaClientDirect');

/**
 * User Repository - Data access layer for User operations
 * Uses direct pg client for critical queries to bypass Prisma adapter issues
 */
class UserRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    // Use direct client to bypass Prisma adapter issues
    return prismaClientDirect.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    // Use direct client to bypass Prisma adapter issues
    return prismaClientDirect.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create new user
   * @param {Object} data - User data
   * @returns {Promise<Object>} Created user object
   */
  static async create(data) {
    // Use direct client for write operations
    return prismaClientDirect.user.create({
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
    // Use direct client for write operations
    return prismaClientDirect.user.update({
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
    // Use direct client for write operations
    return prismaClientDirect.user.delete({
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
      prismaClientDirect.user.findMany({
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
      prismaClientDirect.user.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Count users
   * @returns {Promise<number>} Total user count
   */
  static async count() {
    return prismaClientDirect.user.count();
  }
}

module.exports = UserRepository;
