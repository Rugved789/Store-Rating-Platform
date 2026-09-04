const request = require('supertest');
const AdminService = require('../../src/services/adminService');
const UserRepository = require('../../src/models/User');
const StoreRepository = require('../../src/models/Store');
const JWTUtil = require('../../src/utils/jwt');

jest.mock('../../src/models/User');
jest.mock('../../src/models/Store');
jest.mock('../../src/services/adminService');

describe('Admin Integration Tests', () => {
  let app;
  const adminToken = JWTUtil.generateToken({
    userId: 'admin-1',
    email: 'admin@example.com',
    role: 'ADMIN',
  });

  const userToken = JWTUtil.generateToken({
    userId: 'user-1',
    email: 'user@example.com',
    role: 'USER',
  });

  beforeEach(() => {
    jest.clearAllMocks();

    app = require('express')();
    app.use(require('express').json());
    app.use(require('cookie-parser')());

    const adminRoutes = require('../../src/routes/adminRoutes');
    app.use('/admin', adminRoutes);
    app.use(require('../../src/middleware/errorHandler'));
  });

  describe('Admin Dashboard', () => {
    it('should return dashboard statistics for admin', async () => {
      AdminService.getDashboard.mockResolvedValue({
        totalUsers: 42,
        totalStores: 10,
        totalRatings: 100,
      });

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dashboard.totalUsers).toBe(42);
      expect(response.body.data.dashboard.totalStores).toBe(10);
      expect(response.body.data.dashboard.totalRatings).toBe(100);
    });

    it('should deny non-admin access to dashboard', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should deny unauthenticated access to dashboard', async () => {
      const response = await request(app).get('/admin/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Store Management', () => {
    it('should get paginated list of stores', async () => {
      const stores = [
        { id: 'store-1', name: 'Store A Name Here Store', email: 'store1@example.com' },
      ];

      AdminService.getStores.mockResolvedValue({
        data: stores,
        total: 1,
      });

      const response = await request(app)
        .get('/admin/stores?page=1&limit=10')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stores).toEqual(stores);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.total).toBe(1);
    });

    it('should filter stores by name', async () => {
      const stores = [
        { id: 'store-1', name: 'Coffee Store Name Here Shop' },
      ];

      AdminService.getStores.mockResolvedValue({
        data: stores,
        total: 1,
      });

      const response = await request(app)
        .get('/admin/stores?name=Coffee')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(AdminService.getStores).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Coffee',
      }));
    });

    it('should sort stores in ascending order', async () => {
      AdminService.getStores.mockResolvedValue({
        data: [],
        total: 0,
      });

      const response = await request(app)
        .get('/admin/stores?sortBy=name&sortOrder=asc')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(AdminService.getStores).toHaveBeenCalledWith(expect.objectContaining({
        sortBy: 'name',
        sortOrder: 'asc',
      }));
    });

    it('should get store by ID', async () => {
      const store = {
        id: 'store-1',
        name: 'Test Store Name Here Very Good',
        email: 'store@example.com',
        averageRating: 4.5,
      };

      AdminService.getStore.mockResolvedValue(store);

      const response = await request(app)
        .get('/admin/stores/store-1')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.store).toEqual(store);
    });

    it('should create new store with validation', async () => {
      const newStore = {
        id: 'store-new',
        name: 'New Store Name Here Very Good Store',
        email: 'newstore@example.com',
        address: '123 Main St',
        ownerId: 'owner-1',
      };

      AdminService.createStore.mockResolvedValue(newStore);

      const response = await request(app)
        .post('/admin/stores')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: 'New Store Name Here Very Good Store',
          email: 'newstore@example.com',
          address: '123 Main St',
          ownerId: 'owner-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.store).toEqual(newStore);
    });

    it('should reject store creation with invalid name length', async () => {
      const response = await request(app)
        .post('/admin/stores')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: 'Short', // Too short
          email: 'newstore@example.com',
          address: '123 Main St',
          ownerId: 'owner-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should delete store', async () => {
      AdminService.deleteStore.mockResolvedValue({
        message: 'Store deleted successfully',
      });

      const response = await request(app)
        .delete('/admin/stores/store-1')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should get paginated list of users', async () => {
      const users = [
        { id: 'user-1', name: 'John Doe User', email: 'john@example.com', role: 'USER' },
      ];

      AdminService.getUsers.mockResolvedValue({
        data: users,
        total: 1,
      });

      const response = await request(app)
        .get('/admin/users?page=1&limit=10')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toEqual(users);
    });

    it('should filter users by role', async () => {
      const users = [
        { id: 'admin-1', name: 'Admin User Here', email: 'admin@example.com', role: 'ADMIN' },
      ];

      AdminService.getUsers.mockResolvedValue({
        data: users,
        total: 1,
      });

      const response = await request(app)
        .get('/admin/users?role=ADMIN')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(AdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        role: 'ADMIN',
      }));
    });

    it('should get user by ID with store info if STORE_OWNER', async () => {
      const user = {
        id: 'owner-1',
        name: 'Store Owner User',
        email: 'owner@example.com',
        role: 'STORE_OWNER',
        storeInfo: {
          storeId: 'store-1',
          storeName: 'Test Store Name Here Good',
          averageRating: 4.5,
          totalRatings: 20,
        },
      };

      AdminService.getUser.mockResolvedValue(user);

      const response = await request(app)
        .get('/admin/users/owner-1')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.storeInfo).toBeDefined();
    });

    it('should create new user with validation', async () => {
      const newUser = {
        id: 'user-new',
        name: 'New User Name Here Successfully',
        email: 'newuser@example.com',
        role: 'USER',
      };

      AdminService.createUser.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/admin/users')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: 'New User Name Here Successfully',
          email: 'newuser@example.com',
          password: 'Password@123',
          role: 'USER',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(newUser);
    });

    it('should reject user creation with weak password', async () => {
      const response = await request(app)
        .post('/admin/users')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: 'New User Name Here',
          email: 'newuser@example.com',
          password: 'weak', // Too weak
          role: 'USER',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should delete user', async () => {
      AdminService.deleteUser.mockResolvedValue({
        message: 'User deleted successfully',
      });

      const response = await request(app)
        .delete('/admin/users/user-1')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should deny non-admin access to admin routes', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should deny unauthenticated access to admin routes', async () => {
      const response = await request(app).get('/admin/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
