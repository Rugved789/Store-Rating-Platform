require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma Client with adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg({ pool }),
});

module.exports = prisma;
