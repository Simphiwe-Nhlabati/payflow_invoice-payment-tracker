import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../src/server/services/userService';
import { prisma } from '../../src/server/utils/prisma';
import { passwordUtils } from '../../src/server/utils/password';
import jwt from 'jsonwebtoken';

// Mock JWT
vi.mock('jsonwebtoken', () => {
  const sign = vi.fn();
  const verify = vi.fn();
  return {
    default: { sign, verify },
    sign,
    verify,
  };
});

// Mock the password utils
vi.mock('../../src/server/utils/password', () => {
  return {
    passwordUtils: {
      hash: vi.fn(),
      verify: vi.fn(),
    },
  };
});

// Mock the prisma instance
vi.mock('../../src/server/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('UserService', () => {
  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    const userData = {
      email: mockEmail,
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should register a new user with hashed password', async () => {
      const hashedPassword = 'hashed-password-123';
      const createdUser = {
        id: 'new-user-id',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.user.findUnique as any).mockResolvedValue(null); // No existing user with this email
      (passwordUtils.hash as any).mockResolvedValue(hashedPassword);
      (prisma.user.create as any).mockResolvedValue(createdUser);
      
      const result = await UserService.register(userData);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(passwordUtils.hash).toHaveBeenCalledWith(userData.password, expect.any(Object));
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          businessName: undefined,
          password: hashedPassword,
        },
      });
      expect(result).toEqual({
        id: 'new-user-id',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw an error if user with email already exists', async () => {
      const existingUser = {
        id: 'existing-user-id',
        email: userData.email,
        password: 'hashed-password',
      };
      
      (prisma.user.findUnique as any).mockResolvedValue(existingUser);
      
      await expect(UserService.register(userData))
        .rejects
        .toThrow('A user with this email already exists');
    });
  });

  describe('login', () => {
    const credentials = {
      email: mockEmail,
      password: 'password123',
    };

    it('should login a user with valid credentials', async () => {
      const hashedPassword = 'hashed-password-123';
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const mockAccessToken = 'access-token-123';
      const mockRefreshToken = 'refresh-token-456';
      
      // Mock JWT signing - sign is already mocked in the vi.mock above
      (jwt.sign as any)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);
      
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.verify as any).mockResolvedValue(true);

      const result = await UserService.login(credentials);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      });
      expect(passwordUtils.verify).toHaveBeenCalledWith(credentials.password, hashedPassword);
      expect(result).toEqual({
        user: {
          id: mockUserId,
          email: mockEmail,
          firstName: 'Test',
          lastName: 'User',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it('should throw an error for invalid email', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      
      await expect(UserService.login(credentials))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('should throw an error for invalid password', async () => {
      const hashedPassword = 'hashed-password-123';
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.verify as any).mockResolvedValue(false);

      await expect(UserService.login(credentials))
        .rejects
        .toThrow('Invalid email or password');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile if user exists', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      
      const result = await UserService.getUserProfile(mockUserId);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw an error if user does not exist', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      
      await expect(UserService.getUserProfile(mockUserId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user profile if user exists', async () => {
      const existingUser = {
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedUser = {
        ...existingUser,
        ...updateData,
      };
      
      (prisma.user.update as any).mockResolvedValue(updatedUser);
      
      const result = await UserService.updateUserProfile(mockUserId, updateData);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateData,
      });
      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        firstName: 'Updated',
        lastName: 'Name',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('changePassword', () => {
    const newPassword = 'newPassword123';
    const oldPassword = 'oldPassword123';

    it('should update password if user exists and old password is correct', async () => {
      const existingUser = {
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        password: 'old-hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const newHashedPassword = 'new-hashed-password';
      
      (prisma.user.findUnique as any).mockResolvedValue(existingUser);
      (passwordUtils.verify as any).mockResolvedValue(true); // Old password is correct
      (passwordUtils.hash as any).mockResolvedValue(newHashedPassword);
      (prisma.user.update as any).mockResolvedValue({
        ...existingUser,
        password: newHashedPassword,
      });

      const result = await UserService.changePassword(mockUserId, oldPassword, newPassword);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(passwordUtils.verify).toHaveBeenCalledWith(oldPassword, existingUser.password);
      expect(passwordUtils.hash).toHaveBeenCalledWith(newPassword, expect.any(Object));
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { password: newHashedPassword },
      });
      expect(result).toBe(true);
    });

    it('should throw an error if user does not exist', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      
      await expect(UserService.changePassword(mockUserId, oldPassword, newPassword))
        .rejects
        .toThrow('User not found');
    });

    it('should throw an error if old password is incorrect', async () => {
      const existingUser = {
        id: mockUserId,
        email: mockEmail,
        firstName: 'Test',
        lastName: 'User',
        password: 'old-hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.user.findUnique as any).mockResolvedValue(existingUser);
      (passwordUtils.verify as any).mockResolvedValue(false); // Old password is incorrect

      await expect(UserService.changePassword(mockUserId, oldPassword, newPassword))
        .rejects
        .toThrow('Current password is incorrect');
    });
  });
});