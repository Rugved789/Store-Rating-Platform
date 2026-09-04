const request = require('supertest');
const UserPublicService = require('../../src/services/userPublicService');
const JWTUtil = require('../../src/utils/jwt');

jest.mock('../../src/services/userPublicService');

describe('User Integration Tests', () => {
  let app;

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

    const userRoutes = require('../../src/routes/userRoutes');
    app.use('/', userRoutes);
    app.use(require('../../src/middleware/errorHandler'));
  });

  describe('User Signup', () => {
    it('should create new user with valid data', async () => {
      const newUser = {
        id: 'user-new',
        name: 'New User Name Here Successfully',
        email: 'newuser@example.com',
        role: 'USER',
      };

      UserPublicService.signup.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/auth/signup')
        .send({
          name: 'New User Name Here Successfully',
          email: 'newuser@example.com',
          password: 'Password@123',
          address: '123 Main St',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(newUser);
      expect(response.body.data.message).toBe('User created successfully. Please login.');
    });

    it('should reject signup with short name', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          name: 'Short', // Too short
          email: 'newuser@example.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject signup with invalid email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          name: 'New User Name Here Successfully',
          email: 'invalid-email',
          password: 'Password@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject signup with weak password', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          name: 'New User Name Here Successfully',
          email: 'newuser@example.com',
          password: 'weakpass',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Store Listing', () => {
    it('should get paginated list of stores with user ratings', async () => {
      const stores = [
        {
          id: 'store-1',
          name: 'Store One Name Here Excellent',
          address: '123 Main St',
          averageRating: 4.5,
          userRating: 5,
          totalRatings: 20,
        },
      ];

      UserPublicService.getStoresWithRatings.mockResolvedValue({
        data: stores,
        total: 1,
      });

      const response = await request(app)
        .get('/stores?page=1&limit=10')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stores).toEqual(stores);
      expect(response.body.data.pagination.total).toBe(1);
    });

    it('should search stores by name and address', async () => {
      UserPublicService.getStoresWithRatings.mockResolvedValue({
        data: [],
        total: 0,
      });

      const response = await request(app)
        .get('/stores?search=Coffee')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(UserPublicService.getStoresWithRatings).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          search: 'Coffee',
        })
      );
    });

    it('should sort stores ascending', async () => {
      UserPublicService.getStoresWithRatings.mockResolvedValue({
        data: [],
        total: 0,
      });

      const response = await request(app)
        .get('/stores?sortBy=name&sortOrder=asc')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(UserPublicService.getStoresWithRatings).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          sortBy: 'name',
          sortOrder: 'asc',
        })
      );
    });

    it('should deny unauthenticated access to store listing', async () => {
      const response = await request(app).get('/stores');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rating Submission', () => {
    it('should create new rating for a store', async () => {
      const now = new Date().toISOString();
      const rating = {
        id: 'rating-1',
        userId: 'user-1',
        storeId: 'store-1',
        rating: 5,
        createdAt: now,
        updatedAt: now,
      };

      UserPublicService.submitRating.mockResolvedValue(rating);

      const response = await request(app)
        .post('/stores/store-1/ratings')
        .set('Cookie', `token=${userToken}`)
        .send({ rating: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toEqual(rating);
      expect(response.body.data.message).toBe('Rating submitted successfully');
    });

    it('should update existing rating', async () => {
      const now = new Date().toISOString();
      const rating = {
        id: 'rating-1',
        userId: 'user-1',
        storeId: 'store-1',
        rating: 3,
        createdAt: new Date(new Date(now).getTime() - 1000).toISOString(),
        updatedAt: now,
      };

      UserPublicService.submitRating.mockResolvedValue(rating);

      const response = await request(app)
        .post('/stores/store-1/ratings')
        .set('Cookie', `token=${userToken}`)
        .send({ rating: 3 });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Rating submitted successfully');
    });

    it('should reject rating outside 1-5 range', async () => {
      const response = await request(app)
        .post('/stores/store-1/ratings')
        .set('Cookie', `token=${userToken}`)
        .send({ rating: 10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject rating with invalid type', async () => {
      const response = await request(app)
        .post('/stores/store-1/ratings')
        .set('Cookie', `token=${userToken}`)
        .send({ rating: 'five' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should deny unauthenticated rating submission', async () => {
      const response = await request(app)
        .post('/stores/store-1/ratings')
        .send({ rating: 5 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Password Update', () => {
    it('should update password with correct old password', async () => {
      const updatedUser = {
        id: 'user-1',
        name: 'User Name',
        email: 'user@example.com',
        role: 'USER',
      };

      UserPublicService.updatePassword.mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/auth/update-password')
        .set('Cookie', `token=${userToken}`)
        .send({
          oldPassword: 'OldPassword@123',
          newPassword: 'NewPassword@456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password updated successfully');
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/auth/update-password')
        .set('Cookie', `token=${userToken}`)
        .send({
          oldPassword: 'OldPassword@123',
          newPassword: 'weak', // Too weak
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should deny unauthenticated password update', async () => {
      const response = await request(app)
        .post('/auth/update-password')
        .send({
          oldPassword: 'OldPassword@123',
          newPassword: 'NewPassword@456',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('User Profile', () => {
    it('should get user profile when authenticated', async () => {
      const user = {
        id: 'user-1',
        name: 'John Doe',
        email: 'user@example.com',
        role: 'USER',
      };

      UserPublicService.getCurrentUser.mockResolvedValue(user);

      const response = await request(app)
        .get('/auth/profile')
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(user);
    });

    it('should deny unauthenticated profile access', async () => {
      const response = await request(app).get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
