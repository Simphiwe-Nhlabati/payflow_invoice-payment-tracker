// Use local types and Prisma for database operations
import type { CreatePaymentData } from '../../types/models';
import { Prisma} from '@prisma/client';
// Use the shared prisma instance
import { prisma } from '../utils/prisma';

interface PaymentFilters {
  userId: string;
  invoiceId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export class PaymentService {
  /**
   * Get all payments for a user with filtering
   */
  static async getAllPayments(filters: PaymentFilters) {
    try {
      console.log('PaymentService.getAllPayments called with filters:', filters);
      const { userId, invoiceId, method, startDate, endDate } = filters;

      const whereClause: Prisma.PaymentWhereInput = {
        userId,
        ...(invoiceId && { invoiceId }),
        // Cast 'method' as any or as the specific Prisma Enum
        ...(method && { method: method as any }),
        ...(startDate || endDate ? { 
          paymentDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          }
        } : {}),
      };

      console.log('Prisma whereClause:', whereClause);

      const payments = await prisma.payment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      console.log('Payments retrieved:', payments.length);
      return payments;
    } catch (error) {
      console.error('Error in PaymentService.getAllPayments:', error);
      throw error;
    }
  }

  /**
   * Get a specific payment by ID
   */
  static async getPaymentById(id: string, userId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    return payment;
  }

  /**
   * Create a new payment
   */
  static async createPayment(userId: string, data: CreatePaymentData) {
    // Verify that the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: data.invoiceId,
        userId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found or does not belong to user');
    }

    // Check if the payment amount exceeds the invoice balance
    const existingPayments = await prisma.payment.findMany({
      where: {
        invoiceId: data.invoiceId,
      },
    });

    const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    // Calculate the invoice total from items since it might not be stored
    const invoiceWithItems = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { items: true }
    });
    
    if (!invoiceWithItems) {
      throw new Error('Invoice not found');
    }
    
    const subtotal = invoiceWithItems.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatRate = invoiceWithItems.vatRate || 0.15;
    const vatAmount = Math.round(subtotal * vatRate);
    const invoiceTotal = subtotal + vatAmount;
    
    if (data.amount + totalPaid > invoiceTotal) {
      throw new Error('Payment amount exceeds remaining invoice balance');
    }

    // Convert method to uppercase enum value
    const methodUpper = data.method.toUpperCase().replace('BANK_TRANSFER', 'BANK_TRANSFER').replace('PAYFAST', 'PAYFAST') as any;
    
    console.log('Payment method conversion:', {
      original: data.method,
      converted: methodUpper,
      type: typeof methodUpper
    });
    
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        method: methodUpper, // Convert to uppercase for Prisma enum
        paymentDate: new Date(data.paymentDate),
        reference: data.reference,
        notes: data.notes,
        invoiceId: data.invoiceId,
        userId,
      },
    });

    // Update invoice status based on payment
    if (totalPaid + data.amount >= invoiceTotal) {
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: { status: 'PAID' },
      });
    } else if (totalPaid + data.amount > 0) {
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: { status: 'SENT' }, // Using 'sent' for partially paid invoices
      });
    }

    return payment;
  }

  /**
   * Update an existing payment
   */
  static async updatePayment(id: string, userId: string, data: Partial<CreatePaymentData>) {
    // Verify that the payment exists and belongs to the user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingPayment) {
      throw new Error('Payment not found or does not belong to user');
    }

    // Verify that the invoice exists and belongs to the user (if invoiceId is being updated)
    if (data.invoiceId) {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: data.invoiceId,
          userId,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found or does not belong to user');
      }
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: data.amount,
        method: data.method,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Recalculate and update invoice status based on all payments
    const invoice = await prisma.invoice.findUnique({
      where: { id: updatedPayment.invoiceId },
    });

    if (invoice) {
      const allPaymentsForInvoice = await prisma.payment.findMany({
        where: { invoiceId: updatedPayment.invoiceId },
      });

      const totalPaid = allPaymentsForInvoice.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate the invoice total from items since it might not be stored
      const invoiceWithItems = await prisma.invoice.findUnique({
        where: { id: updatedPayment.invoiceId },
        include: { items: true }
      });
      
      if (invoiceWithItems) {
        const subtotal = invoiceWithItems.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const vatRate = invoiceWithItems.vatRate || 0.15;
        const vatAmount = Math.round(subtotal * vatRate);
        const invoiceTotal = subtotal + vatAmount;
        
        let newStatus = 'pending';
        
        if (totalPaid >= invoiceTotal) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'sent';
        }

        await prisma.invoice.update({
          where: { id: updatedPayment.invoiceId },
          data: { 
            status: newStatus as any 
          },
        });
      }
    }

    return updatedPayment;
  }

  /**
   * Delete a payment
   */
  static async deletePayment(id: string, userId: string) {
    // Verify that the payment exists and belongs to the user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingPayment) {
      throw new Error('Payment not found or does not belong to user');
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id },
    });

    // Potentially update the invoice status back to 'sent' or 'pending'
    const invoice = await prisma.invoice.findUnique({
      where: { id: existingPayment.invoiceId },
    });

    if (invoice) {
      // Recalculate payments for this invoice
      const remainingPayments = await prisma.payment.findMany({
        where: {
          invoiceId: existingPayment.invoiceId,
        },
      });

      const totalPaid = remainingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate the invoice total from items since it might not be stored
      const invoiceWithItems = await prisma.invoice.findUnique({
        where: { id: existingPayment.invoiceId },
        include: { items: true }
      });
      
      if (invoiceWithItems) {
        const subtotal = invoiceWithItems.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const vatRate = invoiceWithItems.vatRate || 0.15;
        const vatAmount = Math.round(subtotal * vatRate);
        const invoiceTotal = subtotal + vatAmount;
        
        let newStatus = 'pending'; // Default to pending
        if (totalPaid >= invoiceTotal) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'sent'; // Using 'sent' instead of 'partial'
        } else {
          newStatus = 'pending';
        }

        await prisma.invoice.update({
          where: { id: existingPayment.invoiceId },
          data: { 
            status: newStatus as any 
          },
        });
      }
    }

    return true;
  }
}