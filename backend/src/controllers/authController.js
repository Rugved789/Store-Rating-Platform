const UserService = require('../services/userService');
const JWTUtil = require('../utils/jwt');

/**
 * Authentication Controller - Handle login and logout operations
 */
class AuthController {
  /**
   * Login user
   * POST /auth/login
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Email and password are required',
        });
      }

      // Authenticate user
      const user = await UserService.authenticate(email, password);

      // Generate JWT token
      const token = JWTUtil.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set httpOnly cookie with token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      });

      // Return user data without token (token is in cookie)
      return res.status(200).json({
        success: true,
        data: {
          user,
          message: 'Login successful',
        },
        error: null,
      });
    } catch (error) {
      // Generic error message to prevent user enumeration
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Invalid email or password',
      });
    }
  }

  /**
   * Logout user
   * POST /auth/logout
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static logout(req, res) {
    try {
      // Clear token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.status(200).json({
        success: true,
        data: {
          message: 'Logout successful',
        },
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Logout failed',
      });
    }
  }

  /**
   * Get current user info
   * GET /auth/me
   * @param {Request} req - Express request object (must have req.user from auth middleware)
   * @param {Response} res - Express response object
   */
  static async getCurrentUser(req, res) {
    try {
      const user = await UserService.getUserById(req.user.userId);

      return res.status(200).json({
        success: true,
        data: { user },
        error: null,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'User not found',
      });
    }
  }
}

module.exports = AuthController;
