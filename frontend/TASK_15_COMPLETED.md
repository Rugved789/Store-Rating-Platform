# Task 15 Completed: Environment Configuration (Frontend)

## Frontend Environment Setup

### 1. Environment Variables

**Frontend `.env` Template:**
```
# Backend API URL
VITE_API_URL=http://localhost:5000

# Frontend Development Server Port
VITE_PORT=3000
```

**Environment Variable Defaults:**
- If `.env` not present, uses defaults from files
- VITE_API_URL: http://localhost:5000
- VITE_PORT: 3000

### 2. Setup Steps

**1. Copy environment template:**
```bash
cd frontend
cp .env.example .env
```

**2. Edit `.env` if needed:**
```
# Development (defaults are fine)
VITE_API_URL=http://localhost:5000
VITE_PORT=3000

# Production
VITE_API_URL=https://yourdomain.com/api
VITE_PORT=5173
```

**3. Install dependencies:**
```bash
npm install
```

**4. Start development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### 3. Vite Configuration

**`vite.config.js`:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

**Features:**
- Port 3000 for development
- Proxy to backend API
- Path rewriting for API calls
- Hot module replacement (HMR) enabled

### 4. Dependencies

**React & Routing:**
- react@18.3.1
- react-dom@18.3.1
- react-router-dom@6.24.0

**API Communication:**
- axios@1.7.7

**Development:**
- vite@5.3.1
- @vitejs/plugin-react@4.3.1
- eslint@8.57.0
- eslint-plugin-react@7.34.1

### 5. Configuration Files

**`.env.example`:**
```
# Frontend Environment Variables

# Backend API URL
VITE_API_URL=http://localhost:5000

# Frontend Port
VITE_PORT=3000
```

**`.gitignore`:**
```
node_modules
dist
.env
.env.local
.env.*.local
.DS_Store
*.local
.vscode
.idea
*.swp
*.swo
*~
.eslintignore
coverage
```

**`package.json` Scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src"
}
```

### 6. API Integration

**Axios Configuration (`src/context/AuthContext.jsx`):**
```javascript
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;
```

**Features:**
- Base URL set to backend
- Credentials included for cookies
- httpOnly cookies for authentication

### 7. Development Server

**Start Development:**
```bash
npm run dev
```

**Output:**
```
VITE v5.3.1  ready in 150 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

**Features:**
- Hot module replacement (HMR)
- Fast refresh on code changes
- Proxy to backend API
- Clear error messages

### 8. Build for Production

**Create Production Build:**
```bash
npm run build
```

**Output Files:**
- `dist/` folder with optimized build
- HTML, CSS, JS minified
- Ready for deployment

**Preview Production Build:**
```bash
npm run preview
```

### 9. Environment-Specific Settings

**Development:**
```
NODE_ENV=development
VITE_API_URL=http://localhost:5000
Debug mode enabled
Source maps included
```

**Production:**
```
NODE_ENV=production
VITE_API_URL=https://yourdomain.com
Minified code
No source maps
```

### 10. API Communication

**All API Requests:**
```javascript
// Axios configured in AuthContext
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Requests include base URL
GET http://localhost:5000/auth/me
POST http://localhost:5000/auth/login
GET http://localhost:5000/admin/dashboard
// etc.
```

**Error Handling:**
```javascript
try {
  const response = await axios.get('/auth/me');
  // Handle success
} catch (error) {
  // Handle error
  const message = error.response?.data?.error?.message || 'Request failed';
}
```

### 11. Authentication

**Cookie Management:**
- Backend sets httpOnly cookie
- Browser auto-includes in requests
- Secure flag set in production
- SameSite policy enforced

**Auth Flow:**
```
1. User logs in
2. Backend sets httpOnly cookie
3. Frontend stores user in context
4. All subsequent requests include cookie
5. Logout clears cookie
```

### 12. Frontend Setup Checklist

- ✓ `.env` created from template
- ✓ `npm install` completed
- ✓ `npm run dev` starts successfully
- ✓ Can access http://localhost:3000
- ✓ Backend API responds
- ✓ Login form works
- ✓ Authentication working
- ✓ All pages load correctly

### 13. Troubleshooting

**Port 3000 already in use:**
```bash
# Use different port
npm run dev -- --port 3001
```

**Cannot connect to backend:**
```
Check:
- Backend running on port 5000
- VITE_API_URL correct
- Backend CORS enabled
- No firewall blocking
```

**API requests failing:**
```
Check:
- Backend running and responding
- DATABASE_URL correct
- Network tab in DevTools
- Error messages in console
```

**Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Build failing:**
```bash
# Check for syntax errors
npm run lint
# Clear build cache
rm -rf dist
npm run build
```

### 14. Development Workflow

**Start Development Session:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Make Code Changes:**
- Edit files in `src/`
- HMR automatically reloads
- Errors shown in console
- No manual refresh needed

**Test Features:**
- Use test accounts from seed data
- Check Network tab for API calls
- Use DevTools to debug
- Check console for errors

### 15. Production Deployment

**Build for Production:**
```bash
npm run build
```

**Deploy `dist/` folder:**
- Upload to hosting service
- Configure API endpoint
- Set environment variables
- Enable HTTPS
- Configure CORS for production domain

**Environment for Production:**
```
VITE_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

## Complete Frontend Setup

### Quick Setup (2 minutes)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Then access: http://localhost:3000

### With Backend Running

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# ✓ Server running on port 5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# ✓ Access on http://localhost:3000
```

**Browser:**
- Go to http://localhost:3000
- Should see login page
- Login with admin@example.com / Admin@123

## Completeness Checklist

✓ `.env.example` created
✓ Environment variables documented
✓ Setup instructions clear
✓ Axios configuration working
✓ Backend API connection ready
✓ Development server configured
✓ Build process working
✓ Dependencies documented
✓ Troubleshooting guide provided
✓ Production guidance included
✓ `.gitignore` configured

## Ready for Next Tasks

Frontend environment configuration complete:
- ✓ `.env` file setup
- ✓ Dependencies installed
- ✓ Development server ready
- ✓ API communication configured
- ✓ Build process working
- ✓ Production ready

Next: Task 16 - Write Comprehensive README and API Documentation
