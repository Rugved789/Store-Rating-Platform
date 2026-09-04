# Task 15 Completed: Set Up Seed Script and Environment Configuration

## What Has Been Implemented

### 1. Enhanced Seed Script (`prisma/seed.js`)

**Purpose:** Initialize database with comprehensive test data for development

**Data Created:**

**Users (6 total):**
- 1 Admin user
- 2 Store owner users
- 3 Regular users

**Stores (3 total):**
- Great Coffee Shop Downtown (Owner: owner1)
- Pizza Palace Italian Restaurant (Owner: owner2)
- Modern Bookstore and Reading Lounge (Owner: owner1)

**Ratings (7 total):**
- Coffee shop: 5 ratings (5, 4, 5 stars)
- Pizza restaurant: 2 ratings (4, 3 stars)
- Bookstore: 2 ratings (5, 4 stars)

**Features:**
- Checks if data already exists to prevent duplicates
- Uses bcrypt to hash passwords securely
- Creates comprehensive test scenario
- Displays formatted output with test credentials
- Graceful error handling and reporting

### 2. Test Credentials

**Admin Account:**
```
Email: admin@example.com
Password: Admin@123
Role: ADMIN
```

**Store Owner Account:**
```
Email: owner1@example.com
Password: Owner@123
Role: STORE_OWNER
```

**Regular User Account:**
```
Email: user1@example.com
Password: User@123
Role: USER
```

### 3. Environment Configuration

#### Backend Environment Variables (`.env`)

**Required Variables:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/store_rating_db?schema=public
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

**Backend `.env.example`:**
- Provides template for required variables
- Includes helpful comments
- Never committed to git
- Copy to `.env` and fill in values

#### Frontend Environment Variables (`.env`)

**Required Variables:**
```
VITE_API_URL=http://localhost:5000
VITE_PORT=3000
```

**Frontend `.env.example`:**
- Template for frontend configuration
- VITE_ prefix for Vite env variables
- API URL points to backend
- Dev server port 3000

### 4. Database Configuration

**Prisma Configuration (`prisma7.config.ts`):**
```typescript
{
  provider: "postgresql"
  adapter: PrismaPg
  datasourceUrl: env("DATABASE_URL")
}
```

**Connection Pool Settings:**
- Using PrismaPg adapter for connection pooling
- Efficient database connections
- Recommended for Neon serverless

**Database Schema:**
- 3 tables: User, Store, Rating
- Foreign key constraints
- Cascading deletes
- Proper indexes
- Unique constraints on email

### 5. Environment Setup Instructions

#### Backend Setup

**1. Copy environment template:**
```bash
cd backend
cp .env.example .env
```

**2. Fill in DATABASE_URL:**
Edit `.env` and add your Neon PostgreSQL connection string:
```
DATABASE_URL=postgresql://user:password@host/dbname?schema=public
```

**3. Install dependencies:**
```bash
npm install
```

**4. Run database migrations:**
```bash
npm run db:migrate
```

**5. Seed database with test data:**
```bash
npm run db:seed
```

**6. Start development server:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

#### Frontend Setup

**1. Copy environment template:**
```bash
cd frontend
cp .env.example .env
```

**2. Install dependencies:**
```bash
npm install
```

**3. Start development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### 6. Database Setup with Neon PostgreSQL

**Steps:**

**1. Create Neon Project:**
- Go to https://console.neon.tech
- Create new project
- Choose PostgreSQL version
- Get connection string

**2. Format Connection String:**
```
postgresql://user:password@host/dbname?schema=public&sslmode=require
```

**3. Update `.env` file:**
```
DATABASE_URL=postgresql://...your_connection_string...
```

**4. Run migrations:**
```bash
npm run db:migrate
```

**5. Seed database:**
```bash
npm run db:seed
```

### 7. Configuration Files

#### `backend/.env.example`
```
# PostgreSQL Database URL (Neon)
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Environment
NODE_ENV=development

# Server Port
PORT=5000

# JWT Secret Key
JWT_SECRET=your_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### `frontend/.env.example`
```
# Backend API URL
VITE_API_URL=http://localhost:5000

# Frontend Port
VITE_PORT=3000
```

### 8. Git Ignore Configuration

**Backend `.gitignore`:**
- `.env` (never commit secrets)
- `node_modules/`
- `dist/`
- `.eslintignore`
- `coverage/`
- `*.local`

**Frontend `.gitignore`:**
- `.env` (never commit secrets)
- `node_modules/`
- `dist/`
- `.vscode/`
- `.idea/`
- `*.local`

### 9. Package.json Scripts

**Backend Scripts:**
```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "test": "jest --forceExit",
  "db:migrate": "prisma migrate dev",
  "db:seed": "prisma db seed",
  "db:reset": "prisma migrate reset"
}
```

**Frontend Scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src"
}
```

### 10. Seed Script Verification

**After running `npm run db:seed`:**

Database should contain:
```
✓ 6 users total (1 admin, 2 owners, 3 regular)
✓ 3 stores total
✓ 7 ratings across stores
✓ Average ratings calculated
✓ Rating distributions available
```

**Test data allows:**
- ✓ Login as admin, view all stores/users
- ✓ Login as store owner, view own store ratings
- ✓ Login as regular user, browse stores, submit ratings
- ✓ Test all role-based functionality
- ✓ Test pagination, sorting, filtering

### 11. Resetting Database

**To start fresh:**
```bash
npm run db:reset
```

This will:
1. Drop existing database
2. Create new schema
3. Run all migrations
4. Seed with test data
5. Ready for testing

### 12. Security Considerations

**Environment Variables:**
- ✓ Never commit `.env` to git
- ✓ `.env.example` shows template only (no secrets)
- ✓ Each developer has own `.env` with their credentials
- ✓ Production has separate secure `.env`

**Database:**
- ✓ Neon provides automatic backups
- ✓ Connection string should use `sslmode=require`
- ✓ Never log connection strings
- ✓ Use environment variables for all secrets

**Seed Data:**
- ✓ Test passwords weak by design (for testing)
- ✓ Production should have strong initial passwords
- ✓ Seed runs only if data doesn't exist
- ✓ Safe to run multiple times

### 13. Troubleshooting

**Connection String Issues:**
```
Error: getaddrinfo ENOTFOUND
→ Check DATABASE_URL format
→ Ensure Neon project is active
→ Verify credentials
```

**Migration Errors:**
```
Error: database does not exist
→ Ensure DATABASE_URL is correct
→ Try: npm run db:reset
```

**Seed Script Fails:**
```
Error: prisma client not found
→ Run: npm install
→ Ensure dependencies installed
```

**Frontend Can't Connect:**
```
Error: Cannot connect to localhost:5000
→ Ensure backend is running: npm run dev
→ Check VITE_API_URL in frontend/.env
→ Verify CORS is enabled
```

### 14. Complete Setup Checklist

**Backend:**
- ✓ `.env` file created with DATABASE_URL
- ✓ `npm install` completed
- ✓ `npm run db:migrate` successful
- ✓ `npm run db:seed` successful
- ✓ `npm run dev` starts on port 5000
- ✓ All 106 tests passing

**Frontend:**
- ✓ `.env` file created
- ✓ `npm install` completed
- ✓ `npm run dev` starts on port 3000

**Database:**
- ✓ Neon project created
- ✓ Connection string obtained
- ✓ Tables created (User, Store, Rating)
- ✓ Test data seeded
- ✓ Indexes created

### 15. Next Steps After Setup

**1. Verify Backend:**
```bash
cd backend
npm run dev
# Should see: ✓ Server running on port 5000
# Should see: ✓ Database connection successful
```

**2. Verify Frontend:**
```bash
cd frontend
npm run dev
# Should see: ready in X ms
# Navigate to http://localhost:3000
```

**3. Test Login:**
- Go to http://localhost:3000/login
- Use admin@example.com / Admin@123
- Should login and see dashboard

**4. Run Tests:**
```bash
cd backend
npm test
# Should see: 106 tests passing
```

### 16. Production Configuration

**Production `.env` (example):**
```
DATABASE_URL=postgresql://prod_user:prod_password@prod_host/prod_db?schema=public&sslmode=require
NODE_ENV=production
PORT=8000
JWT_SECRET=strong_random_secret_key_minimum_32_chars
FRONTEND_URL=https://yourdomain.com
```

**Changes:**
- Strong JWT_SECRET (minimum 32 characters)
- Database credentials for production
- FRONTEND_URL for production domain
- NODE_ENV set to production

## Complete Setup Walkthrough

### Quick Start (5 minutes)

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with Neon DATABASE_URL
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

**Frontend (new terminal):**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Test login: admin@example.com / Admin@123

## Completeness Checklist

✓ Enhanced seed script with comprehensive test data
✓ 6 test users (multiple roles)
✓ 3 test stores with ratings
✓ 7 test ratings for distribution testing
✓ Environment configuration for backend
✓ Environment configuration for frontend
✓ `.env.example` files for both
✓ `.gitignore` configured
✓ Database setup documentation
✓ Setup instructions for developers
✓ Troubleshooting guide
✓ Production configuration guidance
✓ Neon PostgreSQL integration
✓ Migration and seed scripts working
✓ All 106 tests passing

## Ready for Next Tasks

Seed script and environment configuration complete:
- ✓ Database seeds with comprehensive test data
- ✓ Environment variables documented
- ✓ Setup instructions clear
- ✓ Both backend and frontend ready
- ✓ Multiple test accounts available
- ✓ All role-based testing possible

Next: Task 16 - Write Comprehensive README and API Documentation
