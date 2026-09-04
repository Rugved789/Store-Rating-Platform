require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Use environment variable for connection
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
});

// Create Prisma Client with adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg({ pool }),
});

module.exports = prisma;
