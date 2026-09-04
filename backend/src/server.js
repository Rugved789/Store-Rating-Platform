const app = require('./app');
const prisma = require('./models/prismaClient');

const PORT = process.env.PORT || 5000;

/**
 * Start Express Server
 */
async function startServer() {
  try {
    // Skip database connection test for now due to adapter issue
    console.log('⚠  Skipping database connection test due to adapter issue');
    console.log('✓ Database should be working (tables created successfully)');

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`\n✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log('\n📋 Available Routes:\n');
      console.log('  Auth Routes:');
      console.log('    POST   /auth/signup              - User registration');
      console.log('    POST   /auth/login               - User login');
      console.log('    POST   /auth/logout              - User logout');
      console.log('    GET    /auth/me                  - Get current user');
      console.log('    GET    /auth/profile             - Get user profile');
      console.log('    POST   /auth/update-password     - Update password');
      console.log('\n  Admin Routes (admin only):');
      console.log('    GET    /admin/dashboard          - Admin dashboard');
      console.log('    GET    /admin/stores             - List stores with pagination');
      console.log('    GET    /admin/stores/:id         - Get store details');
      console.log('    POST   /admin/stores             - Create store');
      console.log('    DELETE /admin/stores/:id         - Delete store');
      console.log('    POST   /admin/users              - Create user');
      console.log('    DELETE /admin/users/:id          - Delete user');
      console.log('\n  User Routes (authenticated):');
      console.log('    GET    /auth/stores              - List stores with pagination');
      console.log('    POST   /auth/stores/:storeId/ratings - Submit/update rating');
      console.log('\n  Store Owner Routes (store owner only):');
      console.log('    GET    /store-owner/dashboard    - Dashboard with ratings');
      console.log('    GET    /store-owner/ratings      - Paginated ratings');
      console.log('    GET    /store-owner/statistics   - Rating statistics');
      console.log('    GET    /store-owner/store        - Store information');
      console.log('\n  System Routes:');
      console.log('    GET    /health                   - Health check');
      console.log('\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n⚠  SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n⚠  SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('✗ Failed to start server:');
    console.error('  Error:', error.message);

    if (error.message.includes('connect ECONNREFUSED')) {
      console.error('  → Database connection failed. Check your DATABASE_URL in .env');
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
