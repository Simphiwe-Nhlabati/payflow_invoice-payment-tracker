import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { authApi, clientApi, invoiceApi, paymentApi } from '../src/client/api';

// Create a new instance of axios for testing
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Create a mock adapter for the axios instance
const mock = new MockAdapter(api);

describe('API Connection Tests', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mock.reset();
  });

  it('should connect to auth endpoints', async () => {
    // Mock the register endpoint
    mock.onPost('/auth/register').reply(201, {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        accessToken: 'test-token',
      },
    });

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    const response = await authApi.register(userData);
    
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.email).toBe('test@example.com');
  });

  it('should connect to client endpoints', async () => {
    // Mock the get all clients endpoint
    mock.onGet('/clients').reply(200, {
      success: true,
      message: 'Clients retrieved successfully',
      data: {
        clients: [
          {
            id: 'client-1',
            name: 'Test Client',
            email: 'client@example.com',
          },
        ],
      },
    });

    const response = await clientApi.getAll();
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.clients.length).toBe(1);
  });

  it('should connect to invoice endpoints', async () => {
    // Mock the get all invoices endpoint
    mock.onGet('/invoices').reply(200, {
      success: true,
      message: 'Invoices retrieved successfully',
      data: {
        invoices: [
          {
            id: 'invoice-1',
            invoiceNumber: 'INV-001',
            clientId: 'client-1',
            total: 10000, // 100.00 in cents
          },
        ],
      },
    });

    const response = await invoiceApi.getAll();
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.invoices.length).toBe(1);
  });

  it('should connect to payment endpoints', async () => {
    // Mock the create payment endpoint
    mock.onPost('/payments').reply(201, {
      success: true,
      message: 'Payment created successfully',
      data: {
        payment: {
          id: 'payment-1',
          invoiceId: 'invoice-1',
          amount: 10000, // 100.00 in cents
          method: 'EFT',
        },
      },
    });

    const paymentData = {
      invoiceId: 'invoice-1',
      amount: 10000,
      method: 'EFT',
      paymentDate: new Date().toISOString(),
    };

    const response = await paymentApi.create(paymentData);
    
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.payment.amount).toBe(10000);
  });
});