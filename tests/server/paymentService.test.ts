import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { PaymentService } from '../../src/server/services/paymentService';
import { prisma } from '../../src/server/utils/prisma';

// Mock the prisma instance
vi.mock('../../src/server/utils/prisma', () => ({
  prisma: {
    payment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    invoice: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('PaymentService', () => {
  const mockUserId = 'user-123';
  const mockInvoiceId = 'invoice-123';
  const mockPaymentId = 'payment-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPayments', () => {
    it('should return all payments for a user with optional filters', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          amount: 10000, // 100.00 in cents
          method: 'EFT',
          paymentDate: new Date(),
          invoiceId: mockInvoiceId,
          userId: mockUserId,
        },
      ];
      
      (prisma.payment.findMany as Mock).mockResolvedValue(mockPayments);
      
      const result = await PaymentService.getAllPayments({ userId: mockUserId });
      
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPayments);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        userId: mockUserId,
        invoiceId: mockInvoiceId,
        method: 'CREDIT_CARD',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };
      
      (prisma.payment.findMany as Mock).mockResolvedValue([]);
      
      await PaymentService.getAllPayments(filters);
      
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          invoiceId: mockInvoiceId,
          method: 'CREDIT_CARD',
          paymentDate: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31'),
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment if it exists and belongs to the user', async () => {
      const mockPayment = {
        id: mockPaymentId,
        amount: 10000,
        method: 'EFT',
        paymentDate: new Date(),
        invoiceId: mockInvoiceId,
        userId: mockUserId,
      };
      
      (prisma.payment.findFirst as Mock).mockResolvedValue(mockPayment);
      
      const result = await PaymentService.getPaymentById(mockPaymentId, mockUserId);
      
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPaymentId,
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should return null if payment does not exist', async () => {
      (prisma.payment.findFirst as Mock).mockResolvedValue(null);
      
      const result = await PaymentService.getPaymentById('non-existent', mockUserId);
      
      expect(result).toBeNull();
    });
  });

  describe('createPayment', () => {
    const mockPaymentData = {
      amount: 10000, // 100.00 in cents
      method: 'EFT',
      paymentDate: new Date().toISOString(),
      invoiceId: mockInvoiceId,
      reference: 'REF-123',
      notes: 'Test payment',
    };

    it('should create a new payment if invoice exists and belongs to user', async () => {
      const mockInvoice = {
        id: mockInvoiceId,
        userId: mockUserId,
      };
      
      const mockInvoiceWithItems = {
        id: mockInvoiceId,
        vatRate: 0.15,
        items: [
          { quantity: 1, unitPrice: 10000 }, // 100.00
        ],
      };
      
      const createdPayment = {
        id: 'new-payment-id',
        ...mockPaymentData,
        userId: mockUserId,
      };
      
      (prisma.invoice.findFirst as Mock).mockResolvedValue(mockInvoice);
      (prisma.payment.findMany as Mock).mockResolvedValue([]); // No existing payments
      (prisma.invoice.findUnique as Mock).mockResolvedValue(mockInvoiceWithItems);
      (prisma.payment.create as Mock).mockResolvedValue(createdPayment);
      (prisma.invoice.update as Mock).mockResolvedValue({ ...mockInvoice, status: 'paid' });
      
      const result = await PaymentService.createPayment(mockUserId, mockPaymentData);
      
      expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockInvoiceId,
          userId: mockUserId,
        },
      });
      
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          ...mockPaymentData,
          userId: mockUserId,
          paymentDate: new Date(mockPaymentData.paymentDate),
        },
      });
      expect(result).toEqual(createdPayment);
    });

    it('should throw an error if invoice does not exist', async () => {
      (prisma.invoice.findFirst as Mock).mockResolvedValue(null);
      
      await expect(PaymentService.createPayment(mockUserId, mockPaymentData))
        .rejects
        .toThrow('Invoice not found or does not belong to user');
    });

    it('should throw an error if payment amount exceeds remaining invoice balance', async () => {
      const mockInvoice = {
        id: mockInvoiceId,
        userId: mockUserId,
      };
      
      const mockInvoiceWithItems = {
        id: mockInvoiceId,
        vatRate: 0.15,
        items: [
          { quantity: 1, unitPrice: 5000 }, // 50.00
        ],
      };
      
      (prisma.invoice.findFirst as Mock).mockResolvedValue(mockInvoice);
      (prisma.payment.findMany as Mock).mockResolvedValue([]); // No existing payments
      (prisma.invoice.findUnique as Mock).mockResolvedValue(mockInvoiceWithItems);
      
      await expect(PaymentService.createPayment(mockUserId, mockPaymentData)) // Payment of 100.00 for 50.00 invoice
        .rejects
        .toThrow('Payment amount exceeds remaining invoice balance');
    });
  });

  describe('updatePayment', () => {
    const updateData = {
      amount: 9000, // 90.00 in cents
      method: 'credit_card',
      paymentDate: new Date().toISOString(),
    };

    it('should update payment if it exists and belongs to the user', async () => {
      const existingPayment = {
        id: mockPaymentId,
        amount: 10000,
        method: 'EFT',
        paymentDate: new Date(),
        invoiceId: mockInvoiceId,
        userId: mockUserId,
      };
      
      const mockInvoice = {
        id: mockInvoiceId,
        vatRate: 0.15,
        items: [
          { quantity: 1, unitPrice: 10000 }, // 100.00
        ],
      };
      
      const updatedPayment = {
        ...existingPayment,
        ...updateData,
      };
      
      (prisma.payment.findFirst as Mock).mockResolvedValueOnce(existingPayment);
      (prisma.payment.update as Mock).mockResolvedValue(updatedPayment);
      (prisma.invoice.findUnique as Mock).mockResolvedValue(mockInvoice);
      (prisma.payment.findMany as Mock).mockResolvedValue([updatedPayment]);
      (prisma.invoice.update as Mock).mockResolvedValue({ ...mockInvoice, status: 'paid' });
      
      const result = await PaymentService.updatePayment(mockPaymentId, mockUserId, updateData);
      
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPaymentId,
          userId: mockUserId,
        },
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: mockPaymentId },
        data: {
          amount: updateData.amount,
          method: updateData.method,
          paymentDate: new Date(updateData.paymentDate),
          reference: undefined,
          notes: undefined,
        },
      });
      expect(result).toEqual(updatedPayment);
    });

    it('should throw an error if payment does not exist', async () => {
      (prisma.payment.findFirst as Mock).mockResolvedValue(null);
      
      await expect(PaymentService.updatePayment(mockPaymentId, mockUserId, updateData))
        .rejects
        .toThrow('Payment not found or does not belong to user');
    });
  });

  describe('deletePayment', () => {
    it('should delete payment if it exists and belongs to the user', async () => {
      const existingPayment = {
        id: mockPaymentId,
        amount: 10000,
        method: 'EFT',
        paymentDate: new Date(),
        invoiceId: mockInvoiceId,
        userId: mockUserId,
      };
      
      const mockInvoice = {
        id: mockInvoiceId,
        vatRate: 0.15,
        items: [
          { quantity: 1, unitPrice: 10000 }, // 100.00
        ],
      };
      
      (prisma.payment.findFirst as Mock).mockResolvedValue(existingPayment);
      (prisma.payment.delete as Mock).mockResolvedValue(undefined);
      (prisma.invoice.findUnique as Mock).mockResolvedValue(mockInvoice);
      (prisma.payment.findMany as Mock).mockResolvedValue([]);
      (prisma.invoice.update as Mock).mockResolvedValue({ ...mockInvoice, status: 'pending' });
      
      const result = await PaymentService.deletePayment(mockPaymentId, mockUserId);
      
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPaymentId,
          userId: mockUserId,
        },
      });
      expect(prisma.payment.delete).toHaveBeenCalledWith({
        where: { id: mockPaymentId },
      });
      expect(result).toBe(true);
    });

    it('should throw an error if payment does not exist', async () => {
      (prisma.payment.findFirst as Mock).mockResolvedValue(null);
      
      await expect(PaymentService.deletePayment(mockPaymentId, mockUserId))
        .rejects
        .toThrow('Payment not found or does not belong to user');
    });
  });
});