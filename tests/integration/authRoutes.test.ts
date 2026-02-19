import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/server/routes/auth';
import { UserService } from '../../src/server/services/userService';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../../src/server/middleware/errorHandler';

// Mock the UserService
import { vi } from 'vitest';
vi.mock('../../src/server/services/userService');

// Set up environment variables for JWT
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler);

describe('Auth Routes Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockToken = jwt.sign({ userId: mockUser.id, email: mockUser.email }, process.env.JWT_SECRET!);

  beforeAll(() => {
    // Mock implementations
    vi.mocked(UserService.register).mockResolvedValue({
      user: mockUser,
      accessToken: mockToken,
      refreshToken: mockToken,
    });

    vi.mocked(UserService.login).mockResolvedValue({
      user: mockUser,
      accessToken: mockToken,
      refreshToken: mockToken,
    });

    vi.mocked(UserService.getUserProfile).mockResolvedValue(mockUser);
    vi.mocked(UserService.updateUserProfile).mockResolvedValue(mockUser);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toEqual(mockUser);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 400 for invalid registration data', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        password: '123', // Password too short
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toEqual(mockUser);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 400 for invalid login data', async () => {
      const invalidCredentials = {
        email: 'invalid-email', // Invalid email format
        password: '', // Empty password
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidCredentials)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User profile retrieved successfully');
      expect(response.body.data.user).toEqual(mockUser);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update user profile when authenticated', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.user).toEqual(mockUser);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app)
        .put('/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        firstName: '', // Empty first name
        email: 'invalid-email', // Invalid email
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});