// Direct signup helper using native pg client
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class SignupHelper {
  /**
   * Create user directly using raw SQL
   */
  static async createUserDirect(userData) {
    const { name, email, password, role = 'USER' } = userData;

    // Validate input
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      // Check if email exists
      const existingCheck = await client.query(
        'SELECT id FROM "User" WHERE email = $1',
        [email]
      );

      if (existingCheck.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate UUID
      const idResult = await client.query('SELECT gen_random_uuid() as id');
      const userId = idResult.rows[0].id;

      // Create user
      const result = await client.query(`
        INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, name, email, role, "createdAt", "updatedAt"
      `, [userId, name, email, passwordHash, role]);

      return result.rows[0];

    } finally {
      await client.end();
    }
  }

  /**
   * Authenticate user directly using raw SQL
   */
  static async authenticateDirect(email, password) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      // Get user
      const result = await client.query(
        'SELECT id, name, email, "passwordHash", role, "createdAt", "updatedAt" FROM "User" WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Return user without passwordHash
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } finally {
      await client.end();
    }
  }
}

module.exports = SignupHelper;
