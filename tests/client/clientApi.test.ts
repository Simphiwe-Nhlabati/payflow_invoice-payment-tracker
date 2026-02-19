import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { clientApi } from '../../src/client/api/clientApi';

// Mock the default export of the api module BEFORE importing clientApi
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

// Mock client data
const mockClient = {
  id: 'client-123',
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+27123456789',
  address: '123 Main St',
  vatNumber: 'VAT123456789',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-123',
};

describe('clientApi', () => {
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

  describe('getAll', () => {
    it('should get all clients', async () => {
      const mockResponse = {
        success: true,
        message: 'Clients retrieved successfully',
        data: {
          clients: [mockClient],
        },
      };

      // Set up the mock to return the expected response
      mock.onGet('/clients').reply(200, mockResponse);

      const response = await clientApi.getAll();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });

    it('should get all clients with search filter', async () => {
      const mockResponse = {
        success: true,
        message: 'Clients retrieved successfully',
        data: {
          clients: [mockClient],
        },
      };

      // Set up the mock to return the expected response - use regex to match any query params for clients endpoint
      mock.onGet(/^\/clients(\?.*)?$/).reply(200, mockResponse);

      const response = await clientApi.getAll({ search: 'test' });

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should get a client by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Client retrieved successfully',
        data: {
          client: mockClient,
        },
      };

      // Set up the mock to return the expected response
      mock.onGet(`/clients/${mockClient.id}`).reply(200, mockResponse);

      const response = await clientApi.getById(mockClient.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const clientData = {
        name: 'New Client',
        email: 'newclient@example.com',
      };

      const mockResponse = {
        success: true,
        message: 'Client created successfully',
        data: {
          client: mockClient,
        },
      };

      // Set up the mock to return the expected response
      mock.onPost('/clients', clientData).reply(201, mockResponse);

      const response = await clientApi.create(clientData);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateData = {
        name: 'Updated Client',
        email: 'updated@example.com',
      };

      const mockResponse = {
        success: true,
        message: 'Client updated successfully',
        data: {
          client: { ...mockClient, ...updateData },
        },
      };

      // Set up the mock to return the expected response
      mock.onPut(`/clients/${mockClient.id}`, updateData).reply(200, mockResponse);

      const response = await clientApi.update(mockClient.id, updateData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      const mockResponse = {
        success: true,
        message: 'Client deleted successfully',
      };

      // Set up the mock to return the expected response
      mock.onDelete(`/clients/${mockClient.id}`).reply(200, mockResponse);

      const response = await clientApi.delete(mockClient.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });
});