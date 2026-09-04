const UserService = require('../services/userService');
const JWTUtil = require('../utils/jwt');
const SignupHelper = require('../models/signupHelper');

const getTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

/**
 * Authentication Controller - Handle login, logout, and signup operations
 */
class AuthController {
  /**
   * Signup new user
   * POST /auth/signup
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async signup(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Name, email, and password are required',
        });
      }

      // Create user using direct database helper (bypasses adapter issues)
      const user = await SignupHelper.createUserDirect({
        name,
        email,
        password,
        role: 'USER', // Default role for signup
      });

      // Generate JWT token
      const token = JWTUtil.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set httpOnly cookie with token
      res.cookie('token', token, getTokenCookieOptions());

      // Return user data without token (token is in cookie)
      return res.status(201).json({
        success: true,
        data: {
          user,
          message: 'Signup successful',
        },
        error: null,
      });
    } catch (error) {
      console.error('Signup error:', error.message);
      // Handle specific error cases
      if (error.message.includes('User with this email already exists')) {
        return res.status(409).json({
          success: false,
          data: null,
          error: 'User with this email already exists',
        });
      }

      if (error.message.includes('are required')) {
        return res.status(400).json({
          success: false,
          data: null,
          error: error.message,
        });
      }

      // Generic server error
      return res.status(500).json({
        success: false,
        data: null,
        error: error.message || 'Signup failed. Please try again.',
      });
    }
  }

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

      // Authenticate user using direct database helper
      const user = await SignupHelper.authenticateDirect(email, password);

      // Generate JWT token
      const token = JWTUtil.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set httpOnly cookie with token
      res.cookie('token', token, getTokenCookieOptions());

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
      // Clear token cookie with the same options used when it was created.
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
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
