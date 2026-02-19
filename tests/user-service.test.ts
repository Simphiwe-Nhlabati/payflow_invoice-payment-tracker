import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from '../src/server/services/userService';
import { prisma } from '../src/server/utils/prisma';

// Mock Prisma
vi.mock('../src/server/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock Bun.password
vi.mock('bun', () => ({
  password: {
    hash: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'Test Business',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);
      
      const { Bun } = await import('bun');
      (Bun.password.hash as any).mockResolvedValue('hashed-password');

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'Test Business',
      };

      const result = await UserService.register(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(Bun.password.hash).toHaveBeenCalledWith(userData.password, {
        algorithm: 'argon2id',
        iterations: 1,
        memoryCost: 19456,
        timeCost: 2,
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: 'hashed-password',
        },
      });
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'Test Business',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw error if user already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      (prisma.user.findUnique as any).mockResolvedValue(existingUser);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(UserService.register(userData)).rejects.toThrow(
        'A user with this email already exists'
      );
    });
  });

  describe('login', () => {
    it('should authenticate user and return tokens', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashed-password',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      
      const { Bun } = await import('bun');
      (Bun.password.verify as any).mockResolvedValue(true);
      
      const jwt = await import('jsonwebtoken');
      (jwt.default.sign as any)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await UserService.login(credentials);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      });
      expect(Bun.password.verify).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(jwt.default.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw error for invalid credentials', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const credentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      await expect(UserService.login(credentials)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });
});
