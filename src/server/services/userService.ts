// Use local types and Prisma for database operations
import jwt from 'jsonwebtoken';
import type { User, LoginCredentials, RegisterData } from '../../types/models';
// Use the shared prisma instance
import { prisma } from '../utils/prisma';
import { passwordUtils } from '../utils/password';

export class UserService {
  /**
   * Create a new user account
   */
  static async register(userData: RegisterData) {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Hash the password using password utils (which wraps Bun.password)
    const hashedPassword = await passwordUtils.hash(userData.password, {
      algorithm: "argon2id",
      // iterations: 1,
      memoryCost: 19456,
      timeCost: 2,
    });

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        businessName: userData.businessName,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate a user
   */
  static async login(credentials: LoginCredentials) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare passwords using password utils (which wraps Bun.password.verify)
    const isPasswordValid = await passwordUtils.verify(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_access_secret',
      { 
        // The "as any" bypasses the strict overload check
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any 
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      { 
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any 
      }
    );

    // Return user and tokens
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
      ) as { userId: string; email: string };

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User no longer exists');
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_access_secret',
        { 
          expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any 
        }
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updateData: Partial<User>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidCurrentPassword = await passwordUtils.verify(currentPassword, user.password);

    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password using password utils (which wraps Bun.password)
    const hashedNewPassword = await passwordUtils.hash(newPassword, {
      algorithm: "argon2id",
      // iterations: 1,
      memoryCost: 19456,
      timeCost: 2,
    });

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return true;
  }
}