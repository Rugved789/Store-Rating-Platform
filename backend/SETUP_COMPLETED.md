# Backend Setup Completed - Task 1

## What Has Been Set Up

### 1. Project Structure
```
backend/
├── src/
│   ├── controllers/     (API controllers)
│   ├── services/        (Business logic)
│   ├── models/          (Data models & Prisma client)
│   ├── routes/          (API routes)
│   ├── middleware/      (Express middleware)
│   ├── validators/      (Input validators)
│   └── utils/           (Utility functions)
├── tests/
│   ├── integration/     (Integration tests)
│   └── services/        (Service unit tests)
├── prisma/
│   ├── schema.prisma    (Database schema)
│   └── seed.js          (Database seed script)
├── .env                 (Local environment - FILL IN YOUR NEON CREDENTIALS)
├── .env.example         (Template for .env)
├── package.json         (Dependencies & scripts)
├── jest.config.js       (Test configuration)
└── prisma7.config.ts    (Prisma 7 configuration)
```

### 2. Dependencies Installed
- **Express.js**: Web framework
- **Prisma**: ORM for PostgreSQL
- **@prisma/client**: Prisma client library
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT generation/verification
- **express-validator**: Input validation
- **cors**: CORS middleware
- **dotenv**: Environment variable management
- **jest**: Unit testing framework
- **supertest**: HTTP assertion library
- **nodemon**: Development server auto-reload

### 3. Database Schema (Prisma)

Three normalized tables with proper constraints and indexes:

#### User
- id (UUID)
- name (max 60 chars)
- email (unique)
- passwordHash
- address (max 400 chars)
- role (ADMIN, USER, STORE_OWNER)
- timestamps: createdAt, updatedAt
- Indexes: email, role, name

#### Store
- id (UUID)
- name
- email
- address (max 400 chars)
- ownerId (FK to User, cascading delete)
- timestamps: createdAt, updatedAt
- Indexes: ownerId, name

#### Rating
- id (UUID)
- userId (FK to User, cascading delete)
- storeId (FK to Store, cascading delete)
- rating (1-5 scale)
- timestamps: createdAt, updatedAt
- Unique constraint: (userId, storeId) - prevents duplicate ratings
- Indexes: userId, storeId

### 4. Configuration Files

- **.env.example**: Template with all required environment variables
- **prisma7.config.ts**: Prisma configuration pointing to DATABASE_URL
- **jest.config.js**: Test runner configuration

### 5. Seed Script

Located at `prisma/seed.js` - Creates initial admin user:
- Email: admin@example.com
- Password: Admin@123
- Role: ADMIN

### 6. Available npm Scripts

```bash
npm run dev            # Start development server with nodemon
npm start              # Start production server
npm test               # Run Jest tests
npm run db:migrate     # Apply Prisma migrations to Neon
npm run db:seed        # Seed initial data
npm run db:reset       # Reset database (drop and recreate)
```

## Next Steps: Neon Setup

**IMPORTANT**: Before proceeding with Task 2, you must:

1. Create a free account at https://neon.tech
2. Create a new project
3. Copy your Neon connection string
4. Update `/backend/.env` with your connection string
5. Run `npm run db:migrate` to apply the schema
6. Run `npm run db:seed` to create the initial admin user

See `../NEON_SETUP.md` for detailed instructions.

## Verification

To verify everything is set up correctly once you add your Neon credentials:

```bash
cd backend
npm run db:migrate     # Apply schema to Neon
npm run db:seed        # Create admin user
node src/utils/testConnection.js  # Test connection
```

## Schema Features

✓ Normalized design with proper relationships
✓ Cascading deletes to maintain referential integrity
✓ Unique constraint on userId + storeId for rating upsert pattern
✓ Indexes on frequently queried columns (email, role, name)
✓ Enum type for user roles (type-safe)
✓ Timestamps on all tables for audit trail

## Notes

- All passwords will be hashed with bcrypt before storage
- JWT tokens will be stored in httpOnly cookies (more secure than localStorage)
- No plaintext passwords will ever be returned in API responses
- Database URLs are environment-specific (never hardcoded)

Task 1 is now complete! Ready for Task 2: User Model and Password Hashing.
