// tests/mocks/api-mocks.ts
import { vi } from 'vitest';

// Mock API response types
export interface MockApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

// Create a generic mock API client
export const createMockApiClient = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
};

// Common mock responses
export const mockResponses = {
  success: <T = any>(data: T, status = 200): Promise<MockApiResponse<T>> => 
    Promise.resolve({ data, status, statusText: 'OK' }),
  
  error: (status = 500, message = 'Internal Server Error'): Promise<any> => 
    Promise.reject({ response: { status, data: { message } } }),
  
  unauthorized: () => 
    Promise.reject({ response: { status: 401, data: { message: 'Unauthorized' } } }),
  
  notFound: () => 
    Promise.reject({ response: { status: 404, data: { message: 'Not Found' } } }),
};

// Mock axios specifically
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

// Mock localStorage
export const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getAll: () => ({ ...store }),
  };
})();

// Mock sessionStorage
export const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getAll: () => ({ ...store }),
  };
})();

// Reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockLocalStorage.clear();
  mockSessionStorage.clear();
};