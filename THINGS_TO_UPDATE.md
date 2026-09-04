# Things You Need to Update

## 1. DATABASE CONNECTION (Critical - Must Do First!)

### File: `backend/.env`

**Current:**
```
DATABASE_URL=postgresql://neon_user:neon_password@neon_host/store_rating_db?sslmode=require
JWT_SECRET=dev_jwt_secret_key_12345_rugved
NODE_ENV=development_rugved
PORT=5000
```

**What to Update:**

✅ **DATABASE_URL** - MUST UPDATE
- Get your actual Neon PostgreSQL connection string
- Go to: https://console.neon.tech
- Create new project → Copy connection string
- Replace the entire DATABASE_URL value
- Example: `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`

✅ **JWT_SECRET** - SHOULD UPDATE (for production)
- Change `dev_jwt_secret_key_12345_rugved` to a strong random string
- Minimum 32 characters recommended
- Use: `openssl rand -base64 32` or any password generator
- Current: `dev_jwt_secret_key_12345_rugved` → Change to something unique

✅ **NODE_ENV** - Optional Update
- Current: `development_rugved`
- Options: `development` or `production`
- For production: change to `production`
- Current: `development_rugved` → Change to `development` (remove "rugved")

✅ **PORT** - Optional
- Current: `5000` (default - usually fine)
- Only change if port 5000 is already in use on your machine

✅ **FRONTEND_URL** - Optional to Add
- Add this line if you want to restrict CORS:
- `FRONTEND_URL=http://localhost:3000`

---

## 2. ENVIRONMENT FILES

### Missing: `backend/.env.example` and `frontend/.env`

**Create `backend/.env.example`** (for documentation):
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=your_secret_key_here_minimum_32_chars
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Create `frontend/.env`** (if it doesn't exist):
```
VITE_API_URL=http://localhost:5000
VITE_PORT=3000
```

---

## 3. SEED DATA (Test Users)

### File: `backend/prisma/seed.js`

**Current Test Users:**
- admin@example.com / Admin@123
- owner1@example.com / Owner@123
- owner2@example.com / Owner@123
- user1@example.com / User@123
- user2@example.com / User@123
- user3@example.com / User@123

**What to Update (Optional):**

If you want to use your own test data, update these sections:
```javascript
// Lines 33-34: Change admin credentials
name: 'System Administrator',  // → Your admin name
email: 'admin@example.com',    // → Your admin email

// Lines 41-49: Change store owner names/emails
name: 'John Store Owner',      // → Your store owner names
email: 'owner1@example.com',   // → Your store owner emails

// Lines 53-71: Change regular user names/emails
name: 'Alice Regular User',    // → Your user names
email: 'user1@example.com',    // → Your user emails
```

**Store Information (Optional):**
```javascript
// Lines 78-110: Update store names, emails, addresses
name: 'Great Coffee Shop Downtown',
email: 'coffee@example.com',
address: '123 Main Street, Downtown',
```

---

## 4. PACKAGE.JSON UPDATES (Optional)

### File: `backend/package.json`

**Current:**
```json
"name": "backend",
"description": "",
```

**What to Update:**
```json
"name": "store-rating-backend",
"description": "Store Rating Platform Backend API with Express and Prisma",
"author": "Your Name",
"license": "MIT"
```

### File: `frontend/package.json`

**Current:**
```json
"name": "store-rating-frontend",
"description": "",
```

**What to Update:**
```json
"name": "store-rating-frontend",
"description": "Store Rating Platform Frontend with React and Vite",
"author": "Your Name",
"license": "MIT"
```

---

## 5. SECURITY UPDATES (Production Only)

### For Production Deployment:

**Update `backend/.env` for Production:**
```
DATABASE_URL=postgresql://prod_user:prod_password@prod_host/prod_db?sslmode=require
JWT_SECRET=generate_strong_random_key_here_32_chars_minimum
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your_production_domain.com
```

**Update `backend/src/app.js` (CORS):**
- Current: `origin: process.env.FRONTEND_URL || 'http://localhost:3000'`
- For production: Should only allow your production domain

**Password Requirements:**
- Use strong, randomly generated passwords
- Never share your JWT_SECRET
- Use environment variables for all secrets

---

## 6. DATABASE SETUP (First Time Running)

### When you first run the app:

**Step 1: Update `.env` with real DATABASE_URL**
```bash
# Edit backend/.env
DATABASE_URL=your_neon_connection_string_here
```

**Step 2: Run migrations to create tables**
```bash
cd backend
npm run db:migrate
```

**Step 3: Seed database with test data**
```bash
npm run db:seed
```

**Step 4: Start the application**
```bash
npm run dev
```

---

## 7. OPTIONAL CUSTOMIZATIONS

### 1. Change Application Name/Branding

**Frontend `src/App.jsx` (Line ~30):**
```javascript
// Current:
<a href="/" style={{ color: 'white', textDecoration: 'none' }}>
  Store Rating Platform
</a>

// Change to:
<a href="/" style={{ color: 'white', textDecoration: 'none' }}>
  Your App Name Here
</a>
```

### 2. Update Footer

**Frontend `src/App.jsx` (Line ~80):**
```javascript
// Current:
<p>&copy; 2026 Store Rating Platform. All rights reserved.</p>

// Change to:
<p>&copy; 2024 Your Company Name. All rights reserved.</p>
```

### 3. Add Email/Contact Information

**Add to any page:**
```javascript
Email: contact@yourcompany.com
Phone: +1 (555) 123-4567
```

### 4. Update Color Scheme (Optional)

**Frontend Pages:**
- Search for `backgroundColor: '#333'` (dark color)
- Search for `backgroundColor: '#dc3545'` (red/danger color)
- Replace with your brand colors

---

## 8. GITHUB & VERSION CONTROL

### Before Committing:

**Make sure `.gitignore` includes:**
```
.env
node_modules/
dist/
.DS_Store
*.log
```

**Update `.gitignore` for backend if needed:**
- Add `.env` ✓ (already has it)
- Add `node_modules/` ✓ (already has it)
- Add `dist/` ✓ (already has it)

**Update `.gitignore` for frontend if needed:**
- Add `.env` ✓ (already has it)
- Add `node_modules/` ✓ (already has it)
- Add `dist/` ✓ (already has it)

---

## 9. DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Update `backend/.env` with production DATABASE_URL
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update CORS allowed origins
- [ ] Enable HTTPS in production
- [ ] Set secure cookies (`secure: true`)
- [ ] Update frontend API URL in build
- [ ] Test all authentication flows
- [ ] Test all role-based access
- [ ] Test database operations
- [ ] Set up error logging
- [ ] Set up monitoring
- [ ] Configure backups

---

## 10. PRIORITY ORDER (What to Do First)

### ✅ MUST DO (Application Won't Work Without This):
1. **Update `backend/.env` DATABASE_URL** with your Neon connection string
2. Run `npm run db:migrate` to create database tables
3. Run `npm run db:seed` to add test data

### ✅ SHOULD DO (Better for production):
4. Change `JWT_SECRET` to a strong random key
5. Change `NODE_ENV` from `development_rugved` to `development`
6. Create `.env.example` file for documentation

### ✅ NICE TO DO (Optional customizations):
7. Update package.json descriptions
8. Update seed data with your own test users
9. Change application name/branding
10. Update footer with your company info

---

## 11. COMMON MISTAKES TO AVOID

❌ **DO NOT:**
- Commit `.env` file to git (contains secrets!)
- Share your JWT_SECRET publicly
- Use default/example DATABASE_URL in production
- Leave `NODE_ENV=development_rugved` (remove "rugved")
- Forget to run migrations before seeding
- Use weak passwords for JWT_SECRET

✅ **DO:**
- Keep `.env` in `.gitignore` ✓ (already configured)
- Use strong random JWT_SECRET
- Use proper Neon connection string
- Test database connection before running app
- Back up your database regularly
- Use HTTPS in production

---

## 12. NEXT STEPS

1. **Get Neon Connection String:**
   - Go to https://console.neon.tech
   - Create/select project
   - Copy connection string

2. **Update `.env` File:**
   - Open `backend/.env`
   - Replace DATABASE_URL with your Neon string
   - Save file

3. **Run Migrations:**
   ```bash
   cd backend
   npm run db:migrate
   ```

4. **Seed Database:**
   ```bash
   npm run db:seed
   ```

5. **Start Application:**
   ```bash
   npm run dev  # Terminal 1
   ```
   ```bash
   npm run dev  # Terminal 2 (frontend folder)
   ```

6. **Access Application:**
   - Open http://localhost:3000
   - Login with: admin@example.com / Admin@123

---

## 13. TROUBLESHOOTING

**Error: "Cannot connect to database"**
- Check DATABASE_URL in `.env`
- Verify Neon project is active
- Make sure connection string has `?sslmode=require`

**Error: "Port 5000 already in use"**
- Change PORT in `.env` to 5001, 5002, etc.
- Or kill the process using port 5000

**Error: "migrations pending"**
- Run: `npm run db:migrate`
- Then run: `npm run db:seed`

**Frontend not connecting to backend**
- Check VITE_API_URL in `frontend/.env`
- Verify backend is running on port 5000
- Check browser console for errors

---

## Summary of Changes

| Item | Current | Recommended Change | Priority |
|------|---------|-------------------|----------|
| DATABASE_URL | neon_host placeholder | Your actual Neon URL | 🔴 CRITICAL |
| JWT_SECRET | dev_jwt_secret_key_12345_rugved | Strong random string | 🟠 HIGH |
| NODE_ENV | development_rugved | development | 🟠 HIGH |
| package.json name | backend / store-rating-frontend | Add descriptions | 🟡 MEDIUM |
| Seed data | Test accounts | Your test data | 🟡 MEDIUM |
| App title | Store Rating Platform | Your app name | 🟢 OPTIONAL |
| Footer | 2026 | Current year | 🟢 OPTIONAL |

---

**That's it! These are all the things you need to update. Start with the DATABASE_URL and you'll be good to go!**
