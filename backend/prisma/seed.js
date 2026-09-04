const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

// Create connection pool for seeding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma Client with adapter for seeding
const prisma = new PrismaClient({
  adapter: new PrismaPg({ pool }),
});

/**
 * Seed Script - Initialize database with test data
 * Run with: npm run db:seed
 */
async function main() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Check if seed already ran
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping seed to prevent duplicates.');
      return;
    }

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedOwnerPassword = await bcrypt.hash('Owner@123', 10);
    const hashedUserPassword = await bcrypt.hash('User@123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@example.com',
        passwordHash: hashedAdminPassword,
        role: 'ADMIN',
      },
    });
    console.log('✓ Admin user created');

    // Create store owner users
    const owner1 = await prisma.user.create({
      data: {
        name: 'John Store Owner',
        email: 'owner1@example.com',
        passwordHash: hashedOwnerPassword,
        role: 'STORE_OWNER',
      },
    });
    console.log('✓ Store owner 1 created');

    const owner2 = await prisma.user.create({
      data: {
        name: 'Sarah Store Owner',
        email: 'owner2@example.com',
        passwordHash: hashedOwnerPassword,
        role: 'STORE_OWNER',
      },
    });
    console.log('✓ Store owner 2 created');

    // Create regular users
    const user1 = await prisma.user.create({
      data: {
        name: 'Alice Regular User',
        email: 'user1@example.com',
        passwordHash: hashedUserPassword,
        role: 'USER',
      },
    });
    console.log('✓ Regular user 1 created');

    const user2 = await prisma.user.create({
      data: {
        name: 'Bob Regular User',
        email: 'user2@example.com',
        passwordHash: hashedUserPassword,
        role: 'USER',
      },
    });
    console.log('✓ Regular user 2 created');

    const user3 = await prisma.user.create({
      data: {
        name: 'Carol Regular User',
        email: 'user3@example.com',
        passwordHash: hashedUserPassword,
        role: 'USER',
      },
    });
    console.log('✓ Regular user 3 created');

    // Create stores
    const store1 = await prisma.store.create({
      data: {
        name: 'Great Coffee Shop Downtown',
        email: 'coffee@example.com',
        address: '123 Main Street, Downtown',
        ownerId: owner1.id,
      },
    });
    console.log('✓ Store 1 created');

    const store2 = await prisma.store.create({
      data: {
        name: 'Pizza Palace Italian Restaurant',
        email: 'pizza@example.com',
        address: '456 Oak Avenue, Midtown',
        ownerId: owner2.id,
      },
    });
    console.log('✓ Store 2 created');

    const store3 = await prisma.store.create({
      data: {
        name: 'Modern Bookstore and Reading Lounge',
        email: 'books@example.com',
        address: '789 Elm Drive, Uptown',
        ownerId: owner1.id,
      },
    });
    console.log('✓ Store 3 created');

    // Create ratings
    await prisma.rating.create({
      data: {
        storeId: store1.id,
        userId: user1.id,
        rating: 5,
      },
    });

    await prisma.rating.create({
      data: {
        storeId: store1.id,
        userId: user2.id,
        rating: 4,
      },
    });

    await prisma.rating.create({
      data: {
        storeId: store1.id,
        userId: user3.id,
        rating: 5,
      },
    });

    await prisma.rating.create({
      data: {
        storeId: store2.id,
        userId: user1.id,
        rating: 4,
      },
    });

    await prisma.rating.create({
      data: {
        storeId: store2.id,
        userId: user2.id,
        rating: 3,
      },
    });

    await prisma.rating.create({
      data: {
        storeId: store3.id,
        userId: user1.id,
        rating: 5,
      },
    });

    await prisma.rating.create({
      data: {
        storeId: store3.id,
        userId: user3.id,
        rating: 4,
      },
    });

    console.log('✓ Ratings created');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: Admin@123');
    console.log('');
    console.log('Store Owner:');
    console.log('  Email: owner1@example.com');
    console.log('  Password: Owner@123');
    console.log('');
    console.log('Regular User:');
    console.log('  Email: user1@example.com');
    console.log('  Password: User@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
