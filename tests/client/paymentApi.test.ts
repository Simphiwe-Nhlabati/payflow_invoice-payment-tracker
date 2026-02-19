import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { paymentApi } from '../../src/client/api/paymentApi';

// Mock the default export of the api module BEFORE importing paymentApi
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

// Mock payment data
const mockPayment = {
  id: 'payment-123',
  invoiceId: 'invoice-123',
  invoice: {
    id: 'invoice-123',
    invoiceNumber: 'INV-001',
    clientId: 'client-123',
    client: {
      id: 'client-123',
      name: 'Test Client',
    },
    total: 11500, // 115.00 in cents
  },
  amount: 11500, // 115.00 in cents
  method: 'bank_transfer' as const,
  paymentDate: new Date().toISOString(),
  reference: 'REF-123',
  notes: 'Test payment',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-123',
};

describe('paymentApi', () => {
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
    it('should get all payments', async () => {
      const mockResponse = {
        success: true,
        message: 'Payments retrieved successfully',
        data: {
          payments: [mockPayment],
        },
      };

      // Set up the mock to return the expected response
      mock.onGet('/payments').reply(200, mockResponse);

      const response = await paymentApi.getAll();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });

    it('should get all payments with filters', async () => {
      const filters = {
        invoiceId: 'invoice-123',
        method: 'bank_transfer',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      const mockResponse = {
        success: true,
        message: 'Payments retrieved successfully',
        data: {
          payments: [mockPayment],
        },
      };

      // Set up the mock to return the expected response - use regex to match any query params for payments endpoint
      mock.onGet(/^\/payments(\?.*)?$/).reply(200, mockResponse);

      const response = await paymentApi.getAll(filters);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should get a payment by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment retrieved successfully',
        data: {
          payment: mockPayment,
        },
      };

      // Set up the mock to return the expected response
      mock.onGet(`/payments/${mockPayment.id}`).reply(200, mockResponse);

      const response = await paymentApi.getById(mockPayment.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        invoiceId: 'invoice-123',
        amount: 11500, // 115.00 in cents
        method: 'bank_transfer' as const,
        paymentDate: new Date().toISOString(),
        reference: 'REF-123',
        notes: 'Test payment',
      };

      const mockResponse = {
        success: true,
        message: 'Payment created successfully',
        data: {
          payment: mockPayment,
        },
      };

      // Set up the mock to return the expected response
      mock.onPost('/payments', paymentData).reply(201, mockResponse);

      const response = await paymentApi.create(paymentData);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updateData = {
        amount: 10000, // 100.00 in cents
        method: 'credit_card' as const,
      };

      const mockResponse = {
        success: true,
        message: 'Payment updated successfully',
        data: {
          payment: { ...mockPayment, ...updateData },
        },
      };

      // Set up the mock to return the expected response
      mock.onPut(`/payments/${mockPayment.id}`, updateData).reply(200, mockResponse);

      const response = await paymentApi.update(mockPayment.id, updateData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a payment', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment deleted successfully',
      };

      // Set up the mock to return the expected response
      mock.onDelete(`/payments/${mockPayment.id}`).reply(200, mockResponse);

      const response = await paymentApi.delete(mockPayment.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('processPayFast', () => {
    it('should process a PayFast payment', async () => {
      const payFastData = {
        invoiceId: 'invoice-123',
        amount: 11500, // 115.00 in cents
      };

      const mockResponse = {
        success: true,
        message: 'PayFast payment processed successfully',
        data: {
          payment: mockPayment,
        },
      };

      // Set up the mock to return the expected response
      mock.onPost('/payments/payfast/process', payFastData).reply(200, mockResponse);

      const response = await paymentApi.processPayFast(payFastData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });
});