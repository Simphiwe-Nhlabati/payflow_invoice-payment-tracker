import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import invoiceRoutes from '../../src/server/routes/invoices';
import { InvoiceService } from '../../src/server/services/invoiceService';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../../src/server/middleware/errorHandler';

// Mock the InvoiceService
import { vi } from 'vitest';
vi.mock('../../src/server/services/invoiceService');

// Set up environment variables for JWT
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

const app = express();
app.use(express.json());
app.use('/invoices', invoiceRoutes);
app.use(errorHandler);

describe('Invoice Routes Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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

  const mockInvoice = {
    id: 'invoice-123',
    invoiceNumber: 'INV-001',
    clientId: 'client-123',
    client: mockClient,
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

  const mockToken = jwt.sign({ userId: mockUser.id, email: mockUser.email }, process.env.JWT_SECRET!);

  beforeAll(() => {
    // Mock implementations
    vi.mocked(InvoiceService.getAllInvoices).mockResolvedValue([mockInvoice]);
    vi.mocked(InvoiceService.getInvoiceById).mockResolvedValue(mockInvoice);
    vi.mocked(InvoiceService.createInvoice).mockResolvedValue(mockInvoice);
    vi.mocked(InvoiceService.updateInvoice).mockResolvedValue(mockInvoice);
    vi.mocked(InvoiceService.deleteInvoice).mockResolvedValue(true);
    vi.mocked(InvoiceService.markInvoiceAsPaid).mockResolvedValue({ ...mockInvoice, status: 'paid' });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('GET /invoices', () => {
    it('should return all invoices for the authenticated user', async () => {
      const response = await request(app)
        .get('/invoices')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoices retrieved successfully');
      expect(response.body.data.invoices).toEqual([mockInvoice]);
    });

    it('should return invoices with filters', async () => {
      const response = await request(app)
        .get('/invoices?status=paid&clientId=client-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invoices).toEqual([mockInvoice]);
    });
  });

  describe('GET /invoices/:id', () => {
    it('should return a specific invoice', async () => {
      const response = await request(app)
        .get('/invoices/invoice-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoice retrieved successfully');
      expect(response.body.data.invoice).toEqual(mockInvoice);
    });

    it('should return 404 for non-existent invoice', async () => {
      vi.mocked(InvoiceService.getInvoiceById).mockResolvedValue(null);

      const response = await request(app)
        .get('/invoices/non-existent')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice not found');
    });
  });

  describe('POST /invoices', () => {
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

      const response = await request(app)
        .post('/invoices')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invoiceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoice created successfully');
      expect(response.body.data.invoice).toEqual(mockInvoice);
    });

    it('should return 400 for invalid invoice data', async () => {
      const invalidData = {
        clientId: '', // Invalid client ID
        issueDate: 'invalid-date', // Invalid date
        items: [], // Empty items array
      };

      const response = await request(app)
        .post('/invoices')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /invoices/:id', () => {
    it('should update an invoice', async () => {
      const updateData = {
        notes: 'Updated invoice',
      };

      const response = await request(app)
        .put('/invoices/invoice-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoice updated successfully');
      expect(response.body.data.invoice).toEqual(mockInvoice);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        clientId: '', // Invalid client ID
        issueDate: 'invalid-date', // Invalid date
        items: [], // Empty items array
      };

      const response = await request(app)
        .put('/invoices/invoice-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /invoices/:id', () => {
    it('should delete an invoice', async () => {
      const response = await request(app)
        .delete('/invoices/invoice-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoice deleted successfully');
    });
  });

  describe('PATCH /invoices/:id/mark-paid', () => {
    it('should mark an invoice as paid', async () => {
      const response = await request(app)
        .patch('/invoices/invoice-123/mark-paid')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invoice marked as paid successfully');
      expect(response.body.data.invoice.status).toBe('paid');
    });
  });
});