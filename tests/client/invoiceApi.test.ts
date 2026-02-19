import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { invoiceApi } from '../../src/client/api/invoiceApi';

// Mock the default export of the api module BEFORE importing invoiceApi
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

// Mock invoice data
const mockInvoice = {
  id: 'invoice-123',
  invoiceNumber: 'INV-001',
  clientId: 'client-123',
  client: {
    id: 'client-123',
    name: 'Test Client',
    email: 'client@example.com',
    phone: '+27123456789',
    address: '123 Main St',
    vatNumber: 'VAT123456789',
  },
  issueDate: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  status: 'pending' as const,
  subtotal: 10000, // 100.00 in cents
  vatAmount: 1500, // 15.00 in cents (assuming 15% VAT)
  total: 11500, // 115.00 in cents
  currency: 'ZAR',
  notes: 'Test invoice',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-123',
  items: [
    {
      id: 'item-123',
      description: 'Test Item',
      quantity: 1,
      unitPrice: 10000, // 100.00 in cents
      total: 10000, // 100.00 in cents
    },
  ],
};

describe('invoiceApi', () => {
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
    it('should get all invoices', async () => {
      const mockResponse = {
        success: true,
        message: 'Invoices retrieved successfully',
        data: {
          invoices: [mockInvoice],
        },
      };

      // Set up the mock to return the expected response
      mock.onGet('/invoices').reply(200, mockResponse);

      const response = await invoiceApi.getAll();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });

    it('should get all invoices with filters', async () => {
      const filters = {
        status: 'paid',
        clientId: 'client-123',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      const mockResponse = {
        success: true,
        message: 'Invoices retrieved successfully',
        data: {
          invoices: [mockInvoice],
        },
      };

      // Set up the mock to return the expected response - use regex to match any query params for invoices endpoint
      mock.onGet(/^\/invoices(\?.*)?$/).reply(200, mockResponse);

      const response = await invoiceApi.getAll(filters);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should get an invoice by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Invoice retrieved successfully',
        data: {
          invoice: mockInvoice,
        },
      };

      // Set up the mock to return the expected response
      mock.onGet(`/invoices/${mockInvoice.id}`).reply(200, mockResponse);

      const response = await invoiceApi.getById(mockInvoice.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        clientId: 'client-123',
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        currency: 'ZAR',
        notes: 'Test invoice',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 10000, // 100.00 in cents
          },
        ],
      };

      const mockResponse = {
        success: true,
        message: 'Invoice created successfully',
        data: {
          invoice: mockInvoice,
        },
      };

      // Set up the mock to return the expected response
      mock.onPost('/invoices', invoiceData).reply(201, mockResponse);

      const response = await invoiceApi.create(invoiceData);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an invoice', async () => {
      const updateData = {
        notes: 'Updated invoice',
      };

      const mockResponse = {
        success: true,
        message: 'Invoice updated successfully',
        data: {
          invoice: { ...mockInvoice, ...updateData },
        },
      };

      // Set up the mock to return the expected response
      mock.onPut(`/invoices/${mockInvoice.id}`, updateData).reply(200, mockResponse);

      const response = await invoiceApi.update(mockInvoice.id, updateData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an invoice', async () => {
      const mockResponse = {
        success: true,
        message: 'Invoice deleted successfully',
      };

      // Set up the mock to return the expected response
      mock.onDelete(`/invoices/${mockInvoice.id}`).reply(200, mockResponse);

      const response = await invoiceApi.delete(mockInvoice.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('markAsPaid', () => {
    it('should mark an invoice as paid', async () => {
      const mockResponse = {
        success: true,
        message: 'Invoice marked as paid successfully',
        data: {
          invoice: { ...mockInvoice, status: 'paid' },
        },
      };

      // Set up the mock to return the expected response
      mock.onPatch(`/invoices/${mockInvoice.id}/mark-paid`).reply(200, mockResponse);

      const response = await invoiceApi.markAsPaid(mockInvoice.id);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse);
    });
  });
});