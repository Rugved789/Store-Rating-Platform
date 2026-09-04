require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful!');
    console.log('✓ Prisma is connected to Neon PostgreSQL');
    
    return true;
  } catch (error) {
    console.error('✗ Database connection failed!');
    console.error('Error:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testConnection;
