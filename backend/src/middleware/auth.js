const JWTUtil = require('../utils/jwt');

/**
 * Authentication Middleware - Verifies JWT token from httpOnly cookie
 * Attaches user information to req.user if token is valid
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'No authentication token provided',
      });
    }

    // Verify token
    const decoded = JWTUtil.verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      error: error.message || 'Invalid authentication token',
    });
  }
};

module.exports = authMiddleware;
