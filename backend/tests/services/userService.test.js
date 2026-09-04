const UserService = require('../../src/services/userService');
const UserRepository = require('../../src/models/User');
const bcrypt = require('bcryptjs');

// Mock UserRepository
jest.mock('../../src/models/User');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword@123';
      const hash = await UserService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'TestPassword@123';
      const hash1 = await UserService.hashPassword(password);
      const hash2 = await UserService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce a valid bcrypt hash', async () => {
      const password = 'TestPassword@123';
      const hash = await UserService.hashPassword(password);

      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'TestPassword@123';
      const hash = await UserService.hashPassword(password);
      const isValid = await UserService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'TestPassword@123';
      const wrongPassword = 'WrongPassword@123';
      const hash = await UserService.hashPassword(password);
      const isValid = await UserService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'TestPassword@123';
      const hash = await UserService.hashPassword(password);
      const isValid = await UserService.verifyPassword('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
        address: '123 Main St',
        role: 'USER',
      };

      UserRepository.findByEmail.mockResolvedValue(null);
      UserRepository.create.mockResolvedValue({
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        address: userData.address,
        role: userData.role,
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.createUser(userData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', userData.email);
      expect(result).not.toHaveProperty('passwordHash');
      expect(UserRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
      };

      UserRepository.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: userData.email,
      });

      await expect(UserService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error if required fields are missing', async () => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john@example.com',
        // password missing
      };

      UserRepository.findByEmail.mockResolvedValue(null);

      await expect(UserService.createUser(incompleteData)).rejects.toThrow(
        'Email, password, and name are required'
      );
    });

    it('should hash password before storing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
      };

      UserRepository.findByEmail.mockResolvedValue(null);
      UserRepository.create.mockImplementation((data) => {
        // Verify that password hash is provided, not plain password
        expect(data.passwordHash).toBeDefined();
        expect(data.passwordHash).not.toBe(userData.password);
        expect(data.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format

        return Promise.resolve({
          id: 'user-1',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await UserService.createUser(userData);
      expect(UserRepository.create).toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('should authenticate user with correct email and password', async () => {
      const hashedPassword = await UserService.hashPassword('Password@123');
      const user = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        role: 'USER',
      };

      UserRepository.findByEmail.mockResolvedValue(user);

      const result = await UserService.authenticate(
        'john@example.com',
        'Password@123'
      );

      expect(result).toHaveProperty('id', 'user-1');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw error for non-existent user', async () => {
      UserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        UserService.authenticate('nonexistent@example.com', 'Password@123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for wrong password', async () => {
      const hashedPassword = await UserService.hashPassword('Password@123');
      const user = {
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: hashedPassword,
      };

      UserRepository.findByEmail.mockResolvedValue(user);

      await expect(
        UserService.authenticate('john@example.com', 'WrongPassword@123')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('updatePassword', () => {
    it('should update password with correct old password', async () => {
      const oldPassword = 'OldPassword@123';
      const newPassword = 'NewPassword@456';
      const hashedOldPassword = await UserService.hashPassword(oldPassword);

      const user = {
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: hashedOldPassword,
      };

      UserRepository.findById.mockResolvedValue(user);
      UserRepository.update.mockResolvedValue({
        ...user,
        passwordHash: 'new_hashed_password',
      });

      const result = await UserService.updatePassword(
        'user-1',
        oldPassword,
        newPassword
      );

      expect(result).toHaveProperty('id', 'user-1');
      expect(result).not.toHaveProperty('passwordHash');
      expect(UserRepository.update).toHaveBeenCalledWith('user-1', {
        passwordHash: expect.any(String),
      });
    });

    it('should throw error if user not found', async () => {
      UserRepository.findById.mockResolvedValue(null);

      await expect(
        UserService.updatePassword('user-1', 'OldPassword@123', 'NewPassword@456')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if old password is incorrect', async () => {
      const hashedPassword = await UserService.hashPassword('OldPassword@123');
      const user = {
        id: 'user-1',
        passwordHash: hashedPassword,
      };

      UserRepository.findById.mockResolvedValue(user);

      await expect(
        UserService.updatePassword('user-1', 'WrongOldPassword@123', 'NewPassword@456')
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('getUserById', () => {
    it('should return user without password hash', async () => {
      const user = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        role: 'USER',
      };

      UserRepository.findById.mockResolvedValue(user);

      const result = await UserService.getUserById('user-1');

      expect(result).toHaveProperty('id', 'user-1');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw error if user not found', async () => {
      UserRepository.findById.mockResolvedValue(null);

      await expect(UserService.getUserById('nonexistent-user')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('formatUserResponse', () => {
    it('should remove passwordHash from user object', () => {
      const user = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        role: 'USER',
      };

      const result = UserService.formatUserResponse(user);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated list of users', async () => {
      const users = [
        {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'USER',
        },
      ];

      UserRepository.findAll.mockResolvedValue({
        data: users,
        total: 1,
      });

      const result = await UserService.getAllUsers({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toEqual(users);
    });
  });

  describe('getUserCount', () => {
    it('should return total user count', async () => {
      UserRepository.count.mockResolvedValue(42);

      const result = await UserService.getUserCount();

      expect(result).toBe(42);
    });
  });
});
