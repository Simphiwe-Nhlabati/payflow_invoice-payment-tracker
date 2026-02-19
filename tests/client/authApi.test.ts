import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { authApi } from '../../src/client/api/authApi';

// Mock the default export of the api module BEFORE importing authApi
vi.mock('../../src/client/api/api', async () => {
  const mockAxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
  });
  const mock = new MockAdapter(mockAxiosInstance);
  
  // Store the mock instance globally so tests can access it
  (global as any).__MOCK_AXIOS_INSTANCE__ = mockAxiosInstance;
  (global as any).__MOCK_ADAPTER__ = mock;
  
  return {
    default: mockAxiosInstance,
  };
});

// Import authApi after the mock is set up
// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('authApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    // Get the mock adapter instance
    mock = (global as any).__MOCK_ADAPTER__;
    // Reset the mock before each test
    mock.reset();
  });

  afterEach(() => {
    // Clean up after each test
    mock.reset();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const mockResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: mockUser,
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
        },
      };

      // Set up the mock to return the expected response
      mock.onPost('/auth/register', registerData).reply(201, mockResponse);

      const response = await authApi.register(registerData);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
        },
      };

      // Set up the mock to return the expected response
      mock.onPost('/auth/login', loginData).reply(200, mockResponse);

      const response = await authApi.login(loginData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const mockResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: mockUser,
        },
      };

      // Set up the mock to return the expected response
      mock.onGet('/auth/profile').reply(200, mockResponse);

      const response = await authApi.getProfile();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: { ...mockUser, ...updateData },
        },
      };

      // Set up the mock to return the expected response
      mock.onPut('/auth/profile', updateData).reply(200, mockResponse);

      const response = await authApi.updateProfile(updateData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const mockResponse = {
        success: true,
        message: 'Logout successful',
      };

      // Set up the mock to return the expected response
      mock.onPost('/auth/logout').reply(200, mockResponse);

      const response = await authApi.logout();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });
});