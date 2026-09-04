const request = require('supertest');
const UserService = require('../../src/services/userService');
const UserRepository = require('../../src/models/User');
const JWTUtil = require('../../src/utils/jwt');

// Mock UserService and UserRepository
jest.mock('../../src/models/User');
jest.mock('../../src/services/userService');

describe('Authentication Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create fresh app instance for each test
    app = require('express')();
    app.use(require('express').json());
    app.use(require('cookie-parser')());

    const authRoutes = require('../../src/routes/authRoutes');
    app.use('/auth', authRoutes);
  });

  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const userData = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      };

      UserService.authenticate.mockResolvedValue(userData);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(userData);
      expect(response.body.data.message).toBe('Login successful');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    });

    it('should return 401 for non-existent user', async () => {
      UserService.authenticate.mockRejectedValue(
        new Error('Invalid email or password')
      );

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 401 for wrong password', async () => {
      UserService.authenticate.mockRejectedValue(
        new Error('Invalid email or password')
      );

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword@123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'Password@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should set secure httpOnly cookie in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const userData = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      };

      UserService.authenticate.mockResolvedValue(userData);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password@123',
        });

      const setCookieHeader = response.headers['set-cookie'][0];
      expect(setCookieHeader).toContain('Secure');
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('SameSite=Strict');

      process.env.NODE_ENV = originalEnv;
    });

    it('should include correct user role in token', async () => {
      const userData = {
        id: 'user-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      UserService.authenticate.mockResolvedValue(userData);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin@123',
        });

      expect(response.status).toBe(200);

      // Extract token from cookie
      const cookies = response.headers['set-cookie'];
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      const token = tokenCookie.split(';')[0].split('=')[1];

      // Decode and verify token
      const decoded = JWTUtil.decodeToken(token);
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.email).toBe('admin@example.com');
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully logout', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logout successful');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=;');
    });

    it('should clear token cookie', async () => {
      const response = await request(app).post('/auth/logout');

      const setCookieHeader = response.headers['set-cookie'][0];
      expect(setCookieHeader).toContain('token=;');
      // Cookie is cleared either with Max-Age=0 or with Expires=Thu, 01 Jan 1970 00:00:00 GMT
      expect(
        setCookieHeader.includes('Max-Age=0') ||
        setCookieHeader.includes('Expires=Thu, 01 Jan 1970')
      ).toBe(true);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      const userData = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      };

      UserService.getUserById.mockResolvedValue(userData);

      // Generate valid token
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(userData);
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No authentication token provided');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', 'token=invalid_token_xyz');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should return 401 for expired token', async () => {
      // Create expired token by manually signing with past expiry
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'user-1', email: 'user@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('expired');
    });

    it('should return 404 if user not found', async () => {
      UserService.getUserById.mockRejectedValue(new Error('User not found'));

      const token = JWTUtil.generateToken({
        userId: 'nonexistent-user',
        email: 'nonexistent@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('JWT Token Validation', () => {
    it('should have correct payload in token', async () => {
      const userData = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'STORE_OWNER',
      };

      UserService.authenticate.mockResolvedValue(userData);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password@123',
        });

      // Extract and decode token
      const cookies = response.headers['set-cookie'];
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      const token = tokenCookie.split(';')[0].split('=')[1];
      const decoded = JWTUtil.decodeToken(token);

      expect(decoded.userId).toBe('user-1');
      expect(decoded.email).toBe('user@example.com');
      expect(decoded.role).toBe('STORE_OWNER');
      expect(decoded.exp).toBeDefined(); // Expiry time should be set
    });

    it('should expire token after 24 hours', async () => {
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const decoded = JWTUtil.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = decoded.exp - now;

      // Token should expire in approximately 24 hours (86400 seconds)
      // Allow 10 second tolerance for test execution time
      expect(expiryTime).toBeGreaterThan(86390);
      expect(expiryTime).toBeLessThanOrEqual(86400);
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full login->verify->logout flow', async () => {
      const userData = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      };

      UserService.authenticate.mockResolvedValue(userData);
      UserService.getUserById.mockResolvedValue(userData);

      // Step 1: Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password@123',
        });

      expect(loginResponse.status).toBe(200);

      // Extract token from cookie
      const cookies = loginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      const token = tokenCookie.split(';')[0].split('=')[1];

      // Step 2: Use token to get current user
      const meResponse = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.data.user).toEqual(userData);

      // Step 3: Logout
      const logoutResponse = await request(app).post('/auth/logout');

      expect(logoutResponse.status).toBe(200);
    });
  });
});
