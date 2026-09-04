# Neon PostgreSQL Setup Instructions

This project uses **Neon**, a serverless PostgreSQL database. Follow these steps to set up your database connection.

## Step 1: Create a Neon Account

1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project

## Step 2: Get Your Connection String

1. In Neon dashboard, go to your project
2. Click "Connection string" in the right panel
3. Select "Prisma" from the dropdown (if available)
4. Copy the full connection string, which looks like:
   ```
   postgresql://neon_user:neon_password@ep-xxxx-xxxxx.us-east-1.neon.tech/neondb?sslmode=require
   ```

## Step 3: Configure Your .env File

1. Open `/backend/.env`
2. Replace the placeholder with your actual Neon connection string:
   ```
   DATABASE_URL=postgresql://[your-neon-user]:[your-password]@[your-host]/[your-db]?sslmode=require
   JWT_SECRET=your_super_secret_jwt_key_change_this
   NODE_ENV=development
   PORT=5000
   ```

## Step 4: Run Migrations and Seed

Once you've updated `.env` with your Neon credentials:

```bash
cd backend
npm run db:migrate    # Apply schema to Neon
npm run db:seed       # Create initial admin user
```

## Step 5: Verify Setup

To view your database in the Prisma Studio:

```bash
npm run db:studio    # Opens Prisma Studio UI
```

## Initial Admin Credentials

After seeding, you can login with:
- **Email**: admin@example.com
- **Password**: Admin@123

**Important**: Change this password immediately after first login for security.

## Troubleshooting

### Connection Timeout
- Ensure your Neon connection string is correct
- Check that your IP is allowed (Neon allows all IPs by default)
- Verify SSL mode is set to `require`

### Migration Failed
- Check that the DATABASE_URL is correct in `.env`
- Ensure the database and user exist in Neon
- Try running `npm run db:reset` to reset (will drop all data)

### Permission Denied
- Verify your Neon user credentials
- Check that the user has permission to create tables
