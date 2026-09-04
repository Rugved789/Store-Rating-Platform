/**
 * Error Handler Middleware - Centralized error handling
 * Should be the last middleware in the chain
 *
 * Usage in app.js:
 *   app.use(errorHandler);
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, use proper logging service)
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Default error response
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal server error';
  let errorDetails = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation error';
    errorDetails = err.details || null;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    // Prisma database errors
    if (err.code === 'P2002') {
      // Unique constraint violation
      statusCode = 409;
      errorMessage = 'This record already exists';
      errorDetails = { field: err.meta?.target?.[0] };
    } else if (err.code === 'P2025') {
      // Record not found
      statusCode = 404;
      errorMessage = 'Record not found';
    } else {
      // Generic Prisma error
      statusCode = 400;
      errorMessage = 'Database error occurred';
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    errorMessage = 'Invalid request data';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
  }

  // Don't expose internal details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorMessage = 'An unexpected error occurred';
    errorDetails = null;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    data: null,
    error: errorMessage,
    ...(errorDetails && { details: errorDetails }),
  });
};

module.exports = errorHandler;
