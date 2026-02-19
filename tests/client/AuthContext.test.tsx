import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/client/context/AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default state when no stored tokens exist', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.state).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it('should initialize with stored tokens if they exist', async () => {
      const storedTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        userData: JSON.stringify(mockUser),
      };

      localStorageMock.getItem
        .mockImplementation((key: string) => {
          switch (key) {
            case 'accessToken': return storedTokens.accessToken;
            case 'refreshToken': return storedTokens.refreshToken;
            case 'userData': return storedTokens.userData;
            default: return null;
          }
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.state).toEqual({
        user: mockUser,
        accessToken: storedTokens.accessToken,
        refreshToken: storedTokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('should handle invalid stored user data gracefully', async () => {
      localStorageMock.getItem
        .mockImplementation((key: string) => {
          if (key === 'userData') {
            return '{ invalid json';
          }
          return 'valid-token';
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should still set loading to false even with error
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should update state and localStorage on successful login', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const loginData = {
        user: mockUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      await act(async () => {
        result.current.login(loginData);
      });

      expect(result.current.state).toEqual({
        user: mockUser,
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', loginData.accessToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', loginData.refreshToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('should clear state and localStorage on logout', async () => {
      // Set up initial state with logged in user
      localStorageMock.getItem
        .mockImplementation((key: string) => {
          switch (key) {
            case 'accessToken': return 'stored-access-token';
            case 'refreshToken': return 'stored-refresh-token';
            case 'userData': return JSON.stringify(mockUser);
            default: return null;
          }
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verify user is logged in initially
      expect(result.current.state.isAuthenticated).toBe(true);

      await act(async () => {
        result.current.logout();
      });

      expect(result.current.state).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userData');
    });
  });

  describe('updateUser', () => {
    it('should update user data in state and localStorage', async () => {
      // Set up initial state with logged in user
      localStorageMock.getItem
        .mockImplementation((key: string) => {
          switch (key) {
            case 'accessToken': return 'stored-access-token';
            case 'refreshToken': return 'stored-refresh-token';
            case 'userData': return JSON.stringify(mockUser);
            default: return null;
          }
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const updatedUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
      };

      await act(async () => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.state.user).toEqual(updatedUser);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(updatedUser));
    });
  });
});