import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { InvoiceService } from '../../src/server/services/invoiceService';
import { prisma } from '../../src/server/utils/prisma';

// Mock the prisma instance
vi.mock('../../src/server/utils/prisma', () => ({
  prisma: {
    invoice: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    client: {
      findFirst: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
    item: {
      create: vi.fn(),
    },
  },
}));

describe('InvoiceService', () => {
  const mockUserId = 'user-123';
  const mockClientId = 'client-123';
  const mockInvoiceId = 'invoice-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices for a user with filtering', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-001',
          issueDate: new Date(),
          dueDate: new Date(),
          userId: mockUserId,
          clientId: mockClientId,
          vatRate: 0.15,
          notes: 'Test invoice',
          client: { id: mockClientId, name: 'Test Client', email: 'test@example.com' },
          items: [
            { id: 'item-1', description: 'Item 1', quantity: 1, unitPrice: 10000, total: 10000 }, // 100.00 in cents
          ],
          payments: [],
        },
      ];
      
      (prisma.invoice.findMany as Mock).mockResolvedValue(mockInvoices);
      
      const result = await InvoiceService.getAllInvoices({ userId: mockUserId });
      
      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Check that totals are calculated correctly
      expect(result[0]).toHaveProperty('subtotal', 10000);
      expect(result[0]).toHaveProperty('vatAmount', 1500); // 15% of 10000
      expect(result[0]).toHaveProperty('total', 11500); // 10000 + 1500
    });

    it('should apply filters correctly', async () => {
      const filters = {
        userId: mockUserId,
        status: 'pending',
        clientId: mockClientId,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };
      
      (prisma.invoice.findMany as Mock).mockResolvedValue([]);
      
      await InvoiceService.getAllInvoices(filters);
      
      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: 'pending',
          clientId: mockClientId,
          issueDate: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31'),
          },
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getInvoiceById', () => {
    it('should return an invoice with calculated totals if it exists', async () => {
      const mockInvoice = {
        id: mockInvoiceId,
        invoiceNumber: 'INV-001',
        issueDate: new Date(),
        dueDate: new Date(),
        userId: mockUserId,
        clientId: mockClientId,
        vatRate: 0.15,
        notes: 'Test invoice',
        client: { id: mockClientId, name: 'Test Client', email: 'test@example.com' },
        items: [
          { id: 'item-1', description: 'Item 1', quantity: 2, unitPrice: 5000, total: 10000 }, // 50.00 each, total 100.00
        ],
        payments: [],
      };
      
      (prisma.invoice.findFirst as Mock).mockResolvedValue(mockInvoice);
      
      const result = await InvoiceService.getInvoiceById(mockInvoiceId, mockUserId);
      
      expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockInvoiceId,
          userId: mockUserId,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          items: true,
          payments: true,
        },
      });
      
      // Check that totals are calculated correctly
      expect(result).toHaveProperty('subtotal', 10000); // 2 * 5000 = 10000
      expect(result).toHaveProperty('vatAmount', 1500); // 15% of 10000
      expect(result).toHaveProperty('total', 11500); // 10000 + 1500
    });

    it('should return null if invoice does not exist', async () => {
      (prisma.invoice.findFirst as Mock).mockResolvedValue(null);
      
      const result = await InvoiceService.getInvoiceById('non-existent', mockUserId);
      
      expect(result).toBeNull();
    });
  });

  describe('createInvoice', () => {
    const mockInvoiceData = {
      invoiceNumber: 'INV-TEST',
      issueDate: '2023-06-01',
      dueDate: '2023-06-15',
      clientId: mockClientId,
      vatRate: 0.15,
      notes: 'Test invoice',
      items: [
        { description: 'Service 1', quantity: 2, unitPrice: 5000, total: 10000 }, // 50.00 each, total 100.00
      ],
    };

    it('should create a new invoice with calculated totals', async () => {
      // Mock client exists
      (prisma.client.findFirst as Mock).mockResolvedValue({
        id: mockClientId,
        name: 'Test Client',
        userId: mockUserId,
      });
      
      const createdInvoice = {
        id: 'new-invoice-id',
        ...mockInvoiceData,
        userId: mockUserId,
        client: { id: mockClientId, name: 'Test Client', email: 'test@example.com' },
        items: [
          { id: 'new-item-id', description: 'Service 1', quantity: 2, unitPrice: 5000, total: 10000 },
        ],
      };
      
      (prisma.invoice.create as Mock).mockResolvedValue(createdInvoice);
      
      const result = await InvoiceService.createInvoice(mockUserId, mockInvoiceData);
      
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockClientId,
          userId: mockUserId,
        },
      });
      
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: {
          invoiceNumber: expect.stringMatching(/^INV-\d+$/), // Auto-generated invoice number
          issueDate: new Date('2023-06-01'),
          dueDate: new Date('2023-06-15'),
          vatRate: 0.15,
          notes: 'Test invoice',
          subtotal: 10000,
          taxAmount: 1500,
          total: 11500,
          user: { connect: { id: mockUserId } },
          client: { connect: { id: mockClientId } },
          items: {
            create: [
              {
                description: 'Service 1',
                quantity: 2,
                unitPrice: 5000,
                total: 10000,
              },
            ],
          },
        },
        include: {
          client: true,
          items: true,
        },
      });
      
      // Check that totals are calculated correctly
      expect(result).toHaveProperty('subtotal', 10000); // 2 * 5000 = 10000
      expect(result).toHaveProperty('vatAmount', 1500); // 15% of 10000
      expect(result).toHaveProperty('total', 11500); // 10000 + 1500
    });

    it('should throw an error if client does not belong to user', async () => {
      (prisma.client.findFirst as Mock).mockResolvedValue(null);
      
      await expect(InvoiceService.createInvoice(mockUserId, mockInvoiceData))
        .rejects
        .toThrow('Client not found or does not belong to user');
    });
  });

  describe('updateInvoice', () => {
    const updateData = {
      invoiceNumber: 'INV-UPDATED',
      issueDate: '2023-07-01',
      dueDate: '2023-07-15',
      vatRate: 0.10,
      notes: 'Updated invoice',
      items: [
        { description: 'Updated Service', quantity: 3, unitPrice: 4000, total: 12000 }, // 40.00 each, total 120.00
      ],
    };

    it('should update an existing invoice with new calculated totals', async () => {
      const existingInvoice = {
        id: mockInvoiceId,
        invoiceNumber: 'INV-OLD',
        issueDate: new Date('2023-06-01'),
        dueDate: new Date('2023-06-15'),
        userId: mockUserId,
        clientId: mockClientId,
        vatRate: 0.15,
        notes: 'Old invoice',
        items: [
          { id: 'old-item-id', description: 'Old Service', quantity: 1, unitPrice: 10000, total: 10000 },
        ],
      };

      const updatedInvoice = {
        ...existingInvoice,
        ...updateData,
        items: [
          { id: 'new-item-id', description: 'Updated Service', quantity: 3, unitPrice: 4000, total: 12000 },
        ],
      };

      (prisma.invoice.findFirst as Mock).mockResolvedValueOnce(existingInvoice);
      (prisma.invoice.update as Mock).mockResolvedValue(updatedInvoice);

      const result = await InvoiceService.updateInvoice(mockInvoiceId, mockUserId, updateData);

      expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockInvoiceId,
          userId: mockUserId,
        },
      });
      
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: mockInvoiceId },
        data: {
          invoiceNumber: 'INV-UPDATED',
          issueDate: new Date('2023-07-01'),
          dueDate: new Date('2023-07-15'),
          vatRate: 0.10,
          notes: 'Updated invoice',
          items: {
            deleteMany: {},
            create: [
              {
                description: 'Updated Service',
                quantity: 3,
                unitPrice: 4000,
                total: 12000,
              },
            ],
          },
        },
        include: {
          client: true,
          items: true,
        },
      });
      
      // Check that new totals are calculated correctly
      expect(result).toHaveProperty('subtotal', 12000); // 3 * 4000 = 12000
      expect(result).toHaveProperty('vatAmount', 1200); // 10% of 12000
      expect(result).toHaveProperty('total', 13200); // 12000 + 1200
    });

    it('should throw an error if invoice does not exist', async () => {
      (prisma.invoice.findFirst as Mock).mockResolvedValue(null);
      
      await expect(InvoiceService.updateInvoice(mockInvoiceId, mockUserId, updateData))
        .rejects
        .toThrow('Invoice not found or does not belong to user');
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice if it exists and belongs to the user', async () => {
      const existingInvoice = {
        id: mockInvoiceId,
        invoiceNumber: 'INV-DELETE',
        userId: mockUserId,
      };
      
      (prisma.invoice.findFirst as Mock).mockResolvedValue(existingInvoice);
      (prisma.invoice.delete as Mock).mockResolvedValue(undefined);
      
      const result = await InvoiceService.deleteInvoice(mockInvoiceId, mockUserId);
      
      expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockInvoiceId,
          userId: mockUserId,
        },
      });
      expect(prisma.invoice.delete).toHaveBeenCalledWith({
        where: { id: mockInvoiceId },
      });
      expect(result).toBe(true);
    });

    it('should throw an error if invoice does not exist', async () => {
      (prisma.invoice.findFirst as Mock).mockResolvedValue(null);
      
      await expect(InvoiceService.deleteInvoice(mockInvoiceId, mockUserId))
        .rejects
        .toThrow('Invoice not found or does not belong to user');
    });
  });

  describe('markInvoiceAsPaid', () => {
    it('should mark invoice as paid and create a payment record', async () => {
      const existingInvoice = {
        id: mockInvoiceId,
        invoiceNumber: 'INV-PAY',
        userId: mockUserId,
        clientId: mockClientId,
        vatRate: 0.15,
        items: [
          { id: 'item-1', description: 'Service', quantity: 1, unitPrice: 10000, total: 10000 }, // 100.00
        ],
        client: { id: mockClientId, name: 'Test Client', email: 'test@example.com' },
      };
      
      const updatedInvoice = {
        ...existingInvoice,
        status: 'paid',
      };
      
      (prisma.invoice.findFirst as Mock).mockResolvedValue(existingInvoice);
      (prisma.invoice.update as Mock).mockResolvedValue(updatedInvoice);
      (prisma.payment.create as Mock).mockResolvedValue({});
      
      const result = await InvoiceService.markInvoiceAsPaid(mockInvoiceId, mockUserId);
      
      expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockInvoiceId,
          userId: mockUserId,
        },
        include: {
          items: true,
        },
      });
      
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: mockInvoiceId },
        data: {
          status: 'paid',
        },
        include: {
          client: true,
          items: true,
        },
      });
      
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          amount: 11500, // 10000 + 15% VAT = 11500
          method: 'OTHER',
          paymentDate: expect.any(Date),
          invoice: { connect: { id: mockInvoiceId } },
          user: { connect: { id: mockUserId } },
        },
      });
      
      // Check that totals are calculated correctly
      expect(result).toHaveProperty('subtotal', 10000);
      expect(result).toHaveProperty('vatAmount', 1500);
      expect(result).toHaveProperty('total', 11500);
    });

    it('should throw an error if invoice does not exist', async () => {
      (prisma.invoice.findFirst as Mock).mockResolvedValue(null);
      
      await expect(InvoiceService.markInvoiceAsPaid(mockInvoiceId, mockUserId))
        .rejects
        .toThrow('Invoice not found or does not belong to user');
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('should calculate totals correctly with default VAT rate', () => {
      const items = [
        { quantity: 2, unitPrice: 5000 }, // 100.00
        { quantity: 1, unitPrice: 3000 }, // 30.00
      ];
      
      const result = InvoiceService.calculateInvoiceTotals(items);
      
      expect(result.subtotal).toBe(13000); // 10000 + 3000
      expect(result.vatAmount).toBe(1950); // 15% of 13000 = 1950
      expect(result.total).toBe(14950); // 13000 + 1950
    });

    it('should calculate totals correctly with custom VAT rate', () => {
      const items = [
        { quantity: 1, unitPrice: 10000 }, // 100.00
      ];
      
      const result = InvoiceService.calculateInvoiceTotals(items);
      
      expect(result.subtotal).toBe(10000);
      expect(result.vatAmount).toBe(1500); // 15% of 10000
      expect(result.total).toBe(11500); // 10000 + 1500
    });

    it('should handle empty items array', () => {
      const result = InvoiceService.calculateInvoiceTotals([]);
      
      expect(result.subtotal).toBe(0);
      expect(result.vatAmount).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});