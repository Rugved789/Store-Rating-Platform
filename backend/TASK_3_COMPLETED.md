# Task 3 Completed: JWT Auth Middleware and Login/Logout Endpoints

## What Has Been Implemented

### 1. JWT Utility (`src/utils/jwt.js`)
Handles JWT token generation, verification, and decoding:

#### Methods
- `generateToken(payload)` - Generate JWT token with 24-hour expiry
- `verifyToken(token)` - Verify and decode JWT token
- `decodeToken(token)` - Decode token without verification

**Features:**
- 24-hour token expiry
- Proper error handling (expired vs invalid tokens)
- JWT_SECRET loaded from environment variables
- Structured error messages for debugging

### 2. Auth Middleware (`src/middleware/auth.js`)
Middleware for verifying JWT tokens on protected routes:

**Functionality:**
- Extracts JWT token from httpOnly cookie
- Verifies token signature and expiry
- Attaches decoded user info to req.user
- Returns 401 with clear error message if token invalid/missing
- Returns consistent JSON response format

**Response Format:**
```json
{
  "success": false,
  "data": null,
  "error": "Invalid authentication token"
}
```

### 3. Auth Controller (`src/controllers/authController.js`)
Handles authentication operations:

#### Login Method
- `login(req, res)` - POST /auth/login
  - Validates email and password
  - Authenticates user via UserService
  - Generates JWT token
  - Sets httpOnly cookie with token
  - Returns user data (without password) in response
  - Generic error messages prevent user enumeration

#### Logout Method
- `logout(req, res)` - POST /auth/logout
  - Clears JWT token cookie
  - Returns success message

#### Get Current User Method
- `getCurrentUser(req, res)` - GET /auth/me (protected)
  - Returns current authenticated user info
  - Requires valid JWT token

**Response Format:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "..." },
    "message": "Login successful"
  },
  "error": null
}
```

### 4. Auth Routes (`src/routes/authRoutes.js`)
Public and protected authentication routes:

**Public Routes (no auth required):**
- `POST /auth/login` - Authenticate user and set token cookie
- `POST /auth/logout` - Clear token cookie

**Protected Routes (auth required):**
- `GET /auth/me` - Get current authenticated user

### 5. Comprehensive Integration Tests (`tests/integration/auth.test.js`)

#### Test Coverage: 17 Tests (All Passing ✓)

**Login Tests (7 tests)**
- ✓ Successfully login with valid credentials
- ✓ Return 401 for non-existent user
- ✓ Return 401 for wrong password
- ✓ Return 400 if email missing
- ✓ Return 400 if password missing
- ✓ Set secure httpOnly cookie in production
- ✓ Include correct user role in token

**Logout Tests (1 test)**
- ✓ Successfully logout
- ✓ Clear token cookie

**Current User Tests (5 tests)**
- ✓ Return current user when authenticated
- ✓ Return 401 when no token provided
- ✓ Return 401 for invalid token
- ✓ Return 401 for expired token
- ✓ Return 404 if user not found

**JWT Token Validation Tests (2 tests)**
- ✓ Have correct payload in token
- ✓ Expire token after 24 hours

**Full Authentication Flow Test (1 test)**
- ✓ Complete full login→verify→logout flow

### 6. Dependencies Added
- `cookie-parser` - Parse and set cookies on requests/responses

### 7. Cookie Security

**httpOnly Cookies:**
- Token stored in httpOnly cookie (not accessible from JavaScript)
- Prevents XSS attacks from stealing tokens
- Automatically sent with requests to same domain

**Cookie Configuration:**
```javascript
{
  httpOnly: true,           // JavaScript cannot access
  secure: true,             // HTTPS only (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
}
```

## Test Results Summary
```
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Time:        ~10s
Coverage:    All authentication flows tested
```

## Security Features

✓ **JWT Token Storage**: httpOnly cookies prevent XSS
✓ **Token Expiry**: 24-hour expiry enforced by JWT library
✓ **Password Protection**: Generic error messages prevent user enumeration
✓ **CSRF Protection**: SameSite=Strict on cookies
✓ **Secure Flag**: HTTPS only in production
✓ **Token Verification**: Signature validation on every request
✓ **Error Handling**: No stack traces leaked to client

## How It Works

### Login Flow
1. Client sends POST /auth/login with email and password
2. Server validates input (both fields required)
3. Server calls UserService.authenticate() to verify credentials
4. UserService compares password against bcrypt hash
5. If valid, server generates JWT token with user info
6. Server sets httpOnly cookie with token
7. Server returns user data in response (token in cookie, not response body)
8. Client receives success response with user info

### Token Usage on Protected Routes
1. Client makes request to protected route
2. Browser automatically includes httpOnly cookie
3. Auth middleware extracts token from cookie
4. Auth middleware calls JWTUtil.verifyToken()
5. JWT library verifies signature and expiry
6. If valid, decoded user info attached to req.user
7. Controller can access req.user.userId, req.user.role, etc.
8. Route handler proceeds normally

### Logout Flow
1. Client sends POST /auth/logout
2. Server clears httpOnly cookie
3. Client receives success response
4. Cookie is removed from browser
5. Future requests won't include token (401 Unauthorized)

## JWT Payload
Each token contains:
```javascript
{
  userId: "user-1",
  email: "user@example.com",
  role: "USER",  // or ADMIN, STORE_OWNER
  iat: 1234567890,  // issued at time
  exp: 1234654290   // expiry time (24 hours later)
}
```

## Error Handling
- **401 Unauthorized**: No token, invalid token, expired token
- **400 Bad Request**: Missing email or password in login
- **404 Not Found**: User deleted after login
- **Generic Messages**: Prevent user enumeration attacks

## Code Quality
- **Separation of Concerns**: JWT, Auth, Controller separated
- **Consistent Response Format**: All endpoints return {success, data, error}
- **Comprehensive Testing**: All authentication flows tested
- **Security Best Practices**: httpOnly cookies, CSRF protection
- **Error Handling**: Descriptive errors without leaking sensitive info

## Ready for Task 4

The authentication system is now complete and ready for role-based access control:
- Auth middleware can be reused on protected routes
- JWT tokens include user role for RBAC
- All endpoints follow consistent response format
- Token expiry enforced automatically

Next: Task 4 will implement RBAC middleware to enforce role-based route protection.
