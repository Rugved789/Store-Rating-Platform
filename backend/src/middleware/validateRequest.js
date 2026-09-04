const { validationResult } = require('express-validator');

/**
 * Request Validation Middleware
 * Checks for validation errors from express-validator
 * Should be placed after validation chains in routes
 *
 * Usage in routes:
 *   const { body, validationResult } = require('express-validator');
 *   router.post(
 *     '/users',
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 8 }),
 *     validateRequest,  // This middleware checks for errors
 *     controller.createUser
 *   );
 */

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format validation errors for response
    const fieldErrors = {};
    errors.array().forEach((error) => {
      const field = error.param || error.path;
      fieldErrors[field] = error.msg;
    });

    return res.status(400).json({
      success: false,
      data: null,
      error: 'Validation error',
      details: {
        fieldErrors,
      },
    });
  }

  // No errors, proceed to next middleware/handler
  next();
};

module.exports = validateRequest;
