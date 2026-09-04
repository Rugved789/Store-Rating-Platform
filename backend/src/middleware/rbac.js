/**
 * RBAC Middleware - Role-Based Access Control
 * Middleware factory for restricting routes to specific roles
 */

/**
 * Require specific roles to access a route
 * @param {string|Array} roles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 *
 * Usage:
 *   router.get('/admin', requireRole('ADMIN'), controller.handler)
 *   router.get('/stores', requireRole(['USER', 'ADMIN']), controller.handler)
 */
const requireRole = (roles) => {
  // Normalize roles to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    try {
      // Check if user is authenticated (req.user set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          data: null,
          error: 'Authentication required',
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          data: null,
          error: 'Insufficient permissions for this operation',
        });
      }

      // User has required role, proceed to next middleware/handler
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Authorization check failed',
      });
    }
  };
};

/**
 * Require admin role
 * @returns {Function} Express middleware function
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Require store owner role
 * @returns {Function} Express middleware function
 */
const requireStoreOwner = requireRole('STORE_OWNER');

/**
 * Require user role (or higher)
 * @returns {Function} Express middleware function
 */
const requireUser = requireRole(['USER', 'STORE_OWNER', 'ADMIN']);

module.exports = {
  requireRole,
  requireAdmin,
  requireStoreOwner,
  requireUser,
};
