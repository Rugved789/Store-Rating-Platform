require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Use the clean connection string that worked in manual seed
const connectionString = "postgresql://neondb_owner:npg_6ILD4oAQKiFl@ep-shiny-waterfall-aym4asq8-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: connectionString,
});

// Create Prisma Client with adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg({ pool }),
});

module.exports = prisma;
