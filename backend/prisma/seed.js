const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create initial admin user
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        address: '123 Admin Street',
        role: 'ADMIN',
      },
    });

    console.log('✓ Admin user created successfully');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: Admin@123`);
    console.log(`\nPlease change the password after first login for security.`);
  } catch (error) {
    console.error('Error seeding database:', error);
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
