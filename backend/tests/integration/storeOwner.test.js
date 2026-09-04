const request = require('supertest');
const StoreOwnerService = require('../../src/services/storeOwnerService');
const JWTUtil = require('../../src/utils/jwt');

jest.mock('../../src/services/storeOwnerService');

describe('Store Owner Integration Tests', () => {
  let app;

  const storeOwnerToken = JWTUtil.generateToken({
    userId: 'owner-1',
    email: 'owner@example.com',
    role: 'STORE_OWNER',
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

    const storeOwnerRoutes = require('../../src/routes/storeOwnerRoutes');
    app.use('/store-owner', storeOwnerRoutes);
    app.use(require('../../src/middleware/errorHandler'));
  });

  describe('Store Owner Dashboard', () => {
    it('should return dashboard with store and ratings', async () => {
      const dashboard = {
        store: {
          id: 'store-1',
          name: 'My Store Name Here Very Good',
          email: 'store@example.com',
          address: '123 Main St',
        },
        averageRating: 4.5,
        totalRatings: 20,
        ratings: [
          {
            id: 'rating-1',
            userId: 'user-1',
            userName: 'John Doe User Name',
            userEmail: 'john@example.com',
            rating: 5,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      StoreOwnerService.getDashboard.mockResolvedValue(dashboard);

      const response = await request(app)
        .get('/store-owner/dashboard')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dashboard).toEqual(dashboard);
    });

    it('should include list of users who rated the store', async () => {
      const dashboard = {
        store: { id: 'store-1', name: 'Store Name Here Excellent' },
        averageRating: 4.2,
        totalRatings: 15,
        ratings: [
          {
            userName: 'User One Name Here',
            rating: 5,
          },
          {
            userName: 'User Two Name Here',
            rating: 4,
          },
        ],
      };

      StoreOwnerService.getDashboard.mockResolvedValue(dashboard);

      const response = await request(app)
        .get('/store-owner/dashboard')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.dashboard.ratings.length).toBe(2);
    });

    it('should deny non-store-owner access to dashboard', async () => {
      const response = await request(app)
        .get('/store-owner/dashboard')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should deny unauthenticated access to dashboard', async () => {
      const response = await request(app).get('/store-owner/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Store Owner Ratings', () => {
    it('should get paginated list of ratings', async () => {
      const ratings = [
        {
          id: 'rating-1',
          userId: 'user-1',
          userName: 'User Name Here Successfully',
          userEmail: 'user@example.com',
          rating: 5,
        },
      ];

      StoreOwnerService.getRatings.mockResolvedValue({
        data: ratings,
        total: 1,
      });

      const response = await request(app)
        .get('/store-owner/ratings?page=1&limit=10')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ratings).toEqual(ratings);
      expect(response.body.data.pagination.total).toBe(1);
    });

    it('should sort ratings in ascending order', async () => {
      StoreOwnerService.getRatings.mockResolvedValue({
        data: [],
        total: 0,
      });

      const response = await request(app)
        .get('/store-owner/ratings?sortOrder=asc')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(StoreOwnerService.getRatings).toHaveBeenCalledWith(
        'owner-1',
        expect.objectContaining({
          sortOrder: 'asc',
        })
      );
    });

    it('should deny non-store-owner access to ratings', async () => {
      const response = await request(app)
        .get('/store-owner/ratings')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Store Owner Statistics', () => {
    it('should return statistics with average and distribution', async () => {
      const statistics = {
        totalRatings: 50,
        averageRating: 4.2,
        ratingDistribution: {
          '1': 2,
          '2': 3,
          '3': 5,
          '4': 15,
          '5': 25,
        },
      };

      StoreOwnerService.getStatistics.mockResolvedValue(statistics);

      const response = await request(app)
        .get('/store-owner/statistics')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics.averageRating).toBe(4.2);
      expect(response.body.data.statistics.ratingDistribution['5']).toBe(25);
    });

    it('should return zero statistics if no ratings', async () => {
      const statistics = {
        totalRatings: 0,
        averageRating: null,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
      };

      StoreOwnerService.getStatistics.mockResolvedValue(statistics);

      const response = await request(app)
        .get('/store-owner/statistics')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.statistics.totalRatings).toBe(0);
      expect(response.body.data.statistics.averageRating).toBeNull();
    });
  });

  describe('Store Owner Store Info', () => {
    it('should return store information', async () => {
      const store = {
        id: 'store-1',
        name: 'Store Name Here Excellent Shop',
        email: 'store@example.com',
        address: '123 Main St',
        ownerId: 'owner-1',
      };

      StoreOwnerService.getStore.mockResolvedValue(store);

      const response = await request(app)
        .get('/store-owner/store')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.store).toEqual(store);
    });

    it('should deny non-store-owner access to store info', async () => {
      const response = await request(app)
        .get('/store-owner/store')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Access Control', () => {
    it('should deny all store-owner routes to non-authenticated users', async () => {
      const endpoints = ['/store-owner/dashboard', '/store-owner/ratings', '/store-owner/statistics', '/store-owner/store'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }
    });

    it('should deny all store-owner routes to regular users', async () => {
      const endpoints = ['/store-owner/dashboard', '/store-owner/ratings', '/store-owner/statistics', '/store-owner/store'];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Cookie', `token=${userToken}`);
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Response Format', () => {
    it('should return consistent response format', async () => {
      const dashboard = {
        store: { id: 'store-1', name: 'Store Name Here Excellent' },
        averageRating: 4.5,
        totalRatings: 20,
        ratings: [],
      };

      StoreOwnerService.getDashboard.mockResolvedValue(dashboard);

      const response = await request(app)
        .get('/store-owner/dashboard')
        .set('Cookie', `token=${storeOwnerToken}`);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('error', null);
    });
  });
});
