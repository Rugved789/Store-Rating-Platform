const bcrypt = require('bcryptjs');
const UserRepository = require('../models/User');
const prismaClientDirect = require('../models/prismaClientDirect');

/**
 * User Service - Business logic for user operations
 */
class UserService {
  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Password hash
   * @returns {Promise<boolean>} True if password matches, false otherwise
   */
  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create new user with hashed password
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password hash)
   */
  static async createUser(userData) {
    const { email, password, name, address, role } = userData;

    // Check if user already exists
    const existingUser = await prismaClientDirect.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate required fields
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user using direct client
    const user = await prismaClientDirect.user.create({
      data: {
        email,
        name,
        address: address || null,
        passwordHash,
        role: role || 'USER',
      }
    });

    // Return user without password hash
    return this.formatUserResponse(user);
  }

  /**
   * Authenticate user by email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Authenticated user (without password hash)
   */
  static async authenticate(email, password) {
    const user = await prismaClientDirect.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user (without password hash)
   */
  static async updatePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await this.verifyPassword(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update user
    const updatedUser = await UserRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    return this.formatUserResponse(updatedUser);
  }

  /**
   * Get user by ID (without password hash)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  static async getUserById(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: users[], total: number }
   */
  static async getAllUsers(options) {
    return UserRepository.findAll(options);
  }

  /**
   * Format user response (remove password hash)
   * @param {Object} user - User object
   * @returns {Object} User object without passwordHash
   */
  static formatUserResponse(user) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user
   */
  static async deleteUser(userId) {
    const user = await UserRepository.delete(userId);
    return this.formatUserResponse(user);
  }

  /**
   * Count total users
   * @returns {Promise<number>} Total user count
   */
  static async getUserCount() {
    return UserRepository.count();
  }
}

module.exports = UserService;
