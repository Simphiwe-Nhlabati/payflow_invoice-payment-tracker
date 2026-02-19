// tests/mocks/auth-mock.ts
import { vi } from 'vitest';
import type { AuthState } from '../../src/client/context/AuthContext';

// Create a mock auth state
export const createMockAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  isAuthenticated: false,
  user: null,
  token: null,
  ...overrides,
});

// Create a mock auth context value
export const createMockAuthContext = (initialState: Partial<AuthState> = {}) => {
  const mockState = createMockAuthState(initialState);
  
  return {
    state: mockState,
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue({ success: true }),
    checkAuthStatus: vi.fn().mockResolvedValue(mockState),
  };
};

// Mock the useAuth hook
export const mockUseAuth = (initialState: Partial<AuthState> = {}) => {
  const mockContext = createMockAuthContext(initialState);
  
  vi.mock('../../src/client/context/AuthContext', async () => {
    const actual = await vi.importActual('../../src/client/context/AuthContext');
    return {
      ...actual,
      useAuth: vi.fn(() => mockContext),
    };
  });
  
  return mockContext;
};

// Helper to create an authenticated user state
export const createAuthenticatedState = (userData: any = {}) => ({
  isAuthenticated: true,
  user: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    businessName: 'JD Consulting',
    ...userData,
  },
  token: 'mock-jwt-token',
});