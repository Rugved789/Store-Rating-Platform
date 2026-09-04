// Manual seed script - bypasses adapter issues
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function manualSeed() {
  // Create direct PostgreSQL client
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_6ILD4oAQKiFl@ep-shiny-waterfall-aym4asq8-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require",
  });

  try {
    await client.connect();
    console.log('🌱 Starting manual database seed...\n');

    // Check if data exists
    const userCheck = await client.query('SELECT COUNT(*) FROM "User"');
    if (parseInt(userCheck.rows[0].count) > 0) {
      console.log('Database already seeded. Skipping to prevent duplicates.');
      return;
    }

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedOwnerPassword = await bcrypt.hash('Owner@123', 10);
    const hashedUserPassword = await bcrypt.hash('User@123', 10);

    // Create users
    const adminResult = await client.query(`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'System Administrator', 'admin@example.com', $1, 'ADMIN', NOW(), NOW())
      RETURNING id
    `, [hashedAdminPassword]);
    console.log('✓ Admin user created');

    const owner1Result = await client.query(`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'John Store Owner', 'owner1@example.com', $1, 'STORE_OWNER', NOW(), NOW())
      RETURNING id
    `, [hashedOwnerPassword]);
    console.log('✓ Store owner 1 created');

    const owner2Result = await client.query(`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Sarah Store Owner', 'owner2@example.com', $1, 'STORE_OWNER', NOW(), NOW())
      RETURNING id
    `, [hashedOwnerPassword]);
    console.log('✓ Store owner 2 created');

    const user1Result = await client.query(`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Alice Regular User', 'user1@example.com', $1, 'USER', NOW(), NOW())
      RETURNING id
    `, [hashedUserPassword]);
    console.log('✓ Regular user 1 created');

    const user2Result = await client.query(`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Bob Regular User', 'user2@example.com', $1, 'USER', NOW(), NOW())
      RETURNING id
    `, [hashedUserPassword]);
    console.log('✓ Regular user 2 created');

    const user3Result = await client.query(`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Carol Regular User', 'user3@example.com', $1, 'USER', NOW(), NOW())
      RETURNING id
    `, [hashedUserPassword]);
    console.log('✓ Regular user 3 created');

    // Create stores
    const store1Result = await client.query(`
      INSERT INTO "Store" (id, name, email, address, "ownerId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Great Coffee Shop Downtown', 'coffee@example.com', '123 Main Street, Downtown', $1, NOW(), NOW())
      RETURNING id
    `, [owner1Result.rows[0].id]);
    console.log('✓ Store 1 created');

    const store2Result = await client.query(`
      INSERT INTO "Store" (id, name, email, address, "ownerId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Pizza Palace Italian Restaurant', 'pizza@example.com', '456 Oak Avenue, Midtown', $1, NOW(), NOW())
      RETURNING id
    `, [owner2Result.rows[0].id]);
    console.log('✓ Store 2 created');

    const store3Result = await client.query(`
      INSERT INTO "Store" (id, name, email, address, "ownerId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Modern Bookstore and Reading Lounge', 'books@example.com', '789 Elm Drive, Uptown', $1, NOW(), NOW())
      RETURNING id
    `, [owner1Result.rows[0].id]);
    console.log('✓ Store 3 created');

    // Create ratings
    await client.query(`
      INSERT INTO "Rating" (id, "userId", "storeId", rating, "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), $1, $2, 5, NOW(), NOW()),
        (gen_random_uuid(), $3, $2, 4, NOW(), NOW()),
        (gen_random_uuid(), $4, $2, 5, NOW(), NOW()),
        (gen_random_uuid(), $1, $5, 4, NOW(), NOW()),
        (gen_random_uuid(), $3, $5, 3, NOW(), NOW()),
        (gen_random_uuid(), $1, $6, 5, NOW(), NOW()),
        (gen_random_uuid(), $4, $6, 4, NOW(), NOW())
    `, [
      user1Result.rows[0].id, store1Result.rows[0].id,
      user2Result.rows[0].id,
      user3Result.rows[0].id,
      store2Result.rows[0].id,
      store3Result.rows[0].id
    ]);
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
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

manualSeed()
  .catch(console.error)
  .then(() => process.exit(0));