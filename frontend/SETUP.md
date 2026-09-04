# Frontend Setup Guide

## React Frontend for Store Rating Platform

This is the React frontend for the Store Rating Platform, built with Vite, React Router, and Axios.

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

The `.env` file contains:
- `VITE_API_URL` - Backend API endpoint (default: http://localhost:5000)
- `VITE_PORT` - Frontend development server port (default: 3000)

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Output goes to the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                 - App entry point
│   ├── App.jsx                  - Main app component with routing
│   ├── context/
│   │   └── AuthContext.jsx      - Authentication context and hooks
│   ├── components/
│   │   ├── ProtectedRoute.jsx   - Route protection HOC
│   │   └── Loading.jsx          - Loading spinner
│   ├── pages/
│   │   ├── Login.jsx            - Login page (Task 10)
│   │   ├── Signup.jsx           - Signup page (Task 10)
│   │   ├── Dashboard.jsx        - Role-based dashboard
│   │   └── Unauthorized.jsx     - 403 page
│   └── services/                - API services (to be created)
├── index.html                   - HTML entry point
├── vite.config.js              - Vite configuration
├── package.json                - Dependencies
└── .env.example                - Environment template
```

## Features Implemented in Task 9

### Authentication Context (`src/context/AuthContext.jsx`)
- `useAuth()` hook for accessing auth state
- `login(email, password)` - User login
- `signup(name, email, password)` - User registration
- `logout()` - User logout
- `updatePassword(current, new)` - Password update
- `getProfile()` - Fetch user profile
- Authentication state: `user`, `isAuthenticated`, `userRole`, `loading`
- Axios configured with credentials and base URL

### Route Protection (`src/components/ProtectedRoute.jsx`)
- `ProtectedRoute` - Redirects unauthenticated users to login
- `PublicRoute` - Redirects authenticated users to dashboard
- Role-based access control with `requiredRole` prop
- Returns 403 (Unauthorized) page if role doesn't match
- Loading state handling during auth check

### Layout & Navigation
- Persistent navigation bar showing:
  - User name and role when authenticated
  - Login/Signup links when not authenticated
  - Logout button for authenticated users
- Footer with copyright
- Responsive layout structure

### Placeholder Pages
- **Login** - Form placeholder (implemented in Task 10)
- **Signup** - Form placeholder (implemented in Task 10)
- **Dashboard** - Role-aware dashboard
- **Unauthorized** - 403 error page

### Routing Setup
```
/login              - Public route (login page)
/signup             - Public route (signup page)
/dashboard          - Protected route
/admin/*            - Protected route (ADMIN role required)
/store-owner/*      - Protected route (STORE_OWNER role required)
/unauthorized       - Error page for insufficient permissions
```

## How Route Protection Works

### Login Flow
1. User navigates to `/login`
2. `PublicRoute` checks if authenticated
3. If authenticated, redirect to `/dashboard`
4. If not, show login form
5. After login, auth context updates `user` state
6. User is now authenticated

### Protected Page Flow
1. User navigates to `/dashboard` (protected)
2. `ProtectedRoute` checks `isAuthenticated`
3. If not authenticated, redirect to `/login`
4. If authenticated but wrong role, redirect to `/unauthorized`
5. If authenticated and role matches, render page

### Initial Load
1. App mounts, `AuthContext` calls `/auth/me`
2. If user exists (cookie valid), auth state updates
3. If no user (cookie invalid/expired), auth state stays null
4. `loading` flag allows showing loading spinner

## API Integration

### Configured with Axios
- Base URL: `http://localhost:5000`
- Credentials: `true` (includes cookies)
- Ready for API calls

### Example API Calls
```javascript
// In components with useAuth()
const { login } = useAuth();

// Login
const result = await login('user@example.com', 'password');
if (result.success) {
  // User logged in, redirect handled automatically
}

// Logout
const result = await logout();
if (result.success) {
  // User logged out
}
```

## Next Tasks

### Task 10: Build Login and Signup Forms
- Implement form validation
- Add error handling
- Submit forms to backend

### Task 11: Admin Dashboard
- List stores with pagination/sorting
- Create/delete stores
- List/delete users
- View statistics

### Task 12: User Dashboard
- List stores
- Rate stores
- View own ratings

### Task 13: Store Owner Dashboard
- View store information
- View customer ratings
- View statistics

## Debugging

### Enable Debug Mode
Set environment variables for debugging:
```bash
# In .env
VITE_DEBUG=true
```

### Check Authentication State
Open browser console and run:
```javascript
// This will show current auth context state
// Component must be inside AuthProvider
```

### API Requests
- Check Network tab in DevTools
- Verify requests go to `http://localhost:5000`
- Check for CORS errors

### Cookie Issues
- Ensure backend CORS includes credentials
- Check that cookies are being sent (DevTools → Application → Cookies)
- Verify cookie domain settings

## Development Tips

### Hot Module Replacement (HMR)
Vite enables HMR by default. Changes to files automatically reload the browser.

### Strict Mode
React Strict Mode helps identify potential problems. It may cause components to render twice in development.

### Error Boundaries
Not implemented yet but recommended for production.

## Production Build

```bash
npm run build
```

This creates an optimized build in the `dist` folder ready for deployment.

## Common Issues

### Backend Connection Failed
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify CORS is enabled on backend

### Authentication Not Working
- Check that cookies are being sent
- Verify JWT token is valid
- Check browser console for errors

### Routes Not Loading
- Ensure all route components are imported
- Check route paths match
- Verify ProtectedRoute is wrapping routes correctly
