const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const JWTUtil = require('../../src/utils/jwt');
const { requireRole, requireAdmin, requireStoreOwner, requireUser } =
  require('../../src/middleware/rbac');
const authMiddleware = require('../../src/middleware/auth');
const errorHandler = require('../../src/middleware/errorHandler');

describe('RBAC Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Test routes with different RBAC requirements
    app.get(
      '/admin-only',
      authMiddleware,
      requireAdmin,
      (req, res) => {
        res.json({
          success: true,
          data: { message: 'Admin access granted', user: req.user },
          error: null,
        });
      }
    );

    app.get(
      '/store-owner-only',
      authMiddleware,
      requireStoreOwner,
      (req, res) => {
        res.json({
          success: true,
          data: { message: 'Store owner access granted', user: req.user },
          error: null,
        });
      }
    );

    app.get(
      '/user-only',
      authMiddleware,
      requireUser,
      (req, res) => {
        res.json({
          success: true,
          data: { message: 'User access granted', user: req.user },
          error: null,
        });
      }
    );

    app.get(
      '/multiple-roles',
      authMiddleware,
      requireRole(['ADMIN', 'STORE_OWNER']),
      (req, res) => {
        res.json({
          success: true,
          data: { message: 'Access granted', user: req.user },
          error: null,
        });
      }
    );

    app.get(
      '/authenticated',
      authMiddleware,
      (req, res) => {
        res.json({
          success: true,
          data: { message: 'Authenticated user', user: req.user },
          error: null,
        });
      }
    );

    app.use(errorHandler);
  });

  describe('Role-Based Access Control', () => {
    it('should allow ADMIN to access admin-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Admin access granted');
      expect(response.body.data.user.role).toBe('ADMIN');
    });

    it('should deny USER access to admin-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions for this operation');
    });

    it('should deny STORE_OWNER access to admin-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'owner-1',
        email: 'owner@example.com',
        role: 'STORE_OWNER',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions for this operation');
    });

    it('should allow STORE_OWNER to access store-owner-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'owner-1',
        email: 'owner@example.com',
        role: 'STORE_OWNER',
      });

      const response = await request(app)
        .get('/store-owner-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Store owner access granted');
    });

    it('should deny ADMIN access to store-owner-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      const response = await request(app)
        .get('/store-owner-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions for this operation');
    });

    it('should allow USER to access user-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/user-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('User access granted');
    });

    it('should allow ADMIN to access user-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      const response = await request(app)
        .get('/user-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('User access granted');
    });

    it('should allow STORE_OWNER to access user-only route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'owner-1',
        email: 'owner@example.com',
        role: 'STORE_OWNER',
      });

      const response = await request(app)
        .get('/user-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('User access granted');
    });
  });

  describe('Multiple Role Requirements', () => {
    it('should allow ADMIN access when multiple roles allowed', async () => {
      const token = JWTUtil.generateToken({
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      const response = await request(app)
        .get('/multiple-roles')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow STORE_OWNER access when multiple roles allowed', async () => {
      const token = JWTUtil.generateToken({
        userId: 'owner-1',
        email: 'owner@example.com',
        role: 'STORE_OWNER',
      });

      const response = await request(app)
        .get('/multiple-roles')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny USER access when multiple roles allowed', async () => {
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/multiple-roles')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions for this operation');
    });
  });

  describe('Authentication Requirement', () => {
    it('should deny access without authentication token', async () => {
      const response = await request(app).get('/admin-only');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', 'token=invalid-token-xyz');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should allow any authenticated user to access authenticated route', async () => {
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/authenticated')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Authenticated user');
    });
  });

  describe('User Info in Request', () => {
    it('should attach user info to req.user for authorized requests', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      };

      const token = JWTUtil.generateToken(userData);

      const response = await request(app)
        .get('/user-only')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.userId).toBe('user-123');
      expect(response.body.data.user.email).toBe('user@example.com');
      expect(response.body.data.user.role).toBe('USER');
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format for 403 Forbidden', async () => {
      const token = JWTUtil.generateToken({
        userId: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', `token=${token}`);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('data', null);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Insufficient permissions for this operation');
    });

    it('should return consistent error format for 401 Unauthorized', async () => {
      const response = await request(app).get('/admin-only');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('data', null);
      expect(response.body).toHaveProperty('error');
    });

    it('should return consistent success format for authorized requests', async () => {
      const token = JWTUtil.generateToken({
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', `token=${token}`);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('error', null);
    });
  });
});
