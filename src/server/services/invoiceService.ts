// Use local types and Prisma for database operations
import type { CreateInvoiceData, UpdateInvoiceData } from '../../types/models';
import { Prisma } from '@prisma/client';
// Use the shared prisma instance
import { prisma } from '../utils/prisma';

interface InvoiceFilters {
  userId: string;
  status?: any; // Use any here to allow string filtering against Prisma Enums
  clientId?: string;
  startDate?: string;
  endDate?: string;
}

export class InvoiceService {
  /**
   * Get all invoices for a user with filtering and pagination
   */
  static async getAllInvoices(filters: InvoiceFilters) {
    const { userId, status, clientId, startDate, endDate } = filters;

    const whereClause: Prisma.InvoiceWhereInput = {
      userId,
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(startDate || endDate ? {
        issueDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        }
      } : {}),
    };

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
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

    // const invoices: InvoiceWithRelations[] = await prisma.invoice.findMany({
    //   where: { userId },
    //   include: {
    //     items: true,
    //     client: true,
    //     payments: true,
    //   },
    // });

    // Calculate totals for each invoice
    return invoices.map(invoice => {
      const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const vatRate = Number(invoice.vatRate) || 0.15; 
      const vatAmount = Math.round(subtotal * vatRate);
      const total = subtotal + vatAmount;

      return {
        ...invoice,
        subtotal,
        vatAmount,
        total,
      };
    });
  }

  /**
   * Get a specific invoice by ID
   */
  static async getInvoiceById(id: string, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
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

    if (!invoice) {
      return null;
    }

    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatRate = Number(invoice.vatRate) || 0.15;
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;

    return {
      ...invoice,
      subtotal,
      vatAmount,
      total,
    };
  }

  /**
   * Create a new invoice
   */
  static async createInvoice(userId: string, data: CreateInvoiceData) {
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        userId,
      },
    });

    if (!client) {
      throw new Error('Client not found or does not belong to user');
    }

    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatRate = data.vatRate || 0.15;
    const taxAmount = Math.round(subtotal * vatRate);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`, // Auto-generate invoice number
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        vatRate: data.vatRate || 0.15,
        notes: data.notes || null,

        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
        // Use connect for relations
        user: { connect: { id: userId } },
        client: { connect: { id: data.clientId } },
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    // return invoice.map((invoice) => {
    // const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = Math.round(subtotal * Number(invoice.vatRate));
    // const total = subtotal + vatAmount;
      
      return {
        ...invoice,
        subtotal,
        vatAmount,
        total
      };
    // });
  }

  /**
   * Update an existing invoice
   */
  static async updateInvoice(id: string, userId: string, data: UpdateInvoiceData) {
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!existingInvoice) {
      throw new Error('Invoice not found or does not belong to user');
    }

    const updateData: Prisma.InvoiceUpdateInput = {
      ...(data.invoiceNumber && { invoiceNumber: data.invoiceNumber }),
      ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.vatRate !== undefined && { vatRate: data.vatRate }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      // Fix: Relations use 'connect'
      ...(data.clientId && { client: { connect: { id: data.clientId } } }),
      ...(data.items && {
        items: {
          deleteMany: {},
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      }),
      // Fix: Cast status string to Prisma Enum type
      ...(data.status && { status: data.status as any }),
    };

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        items: true,
      },
    });

    const subtotal = updatedInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = Math.round(subtotal * Number(updatedInvoice.vatRate));
    const total = subtotal + vatAmount;

    return {
      ...updatedInvoice,
      subtotal,
      vatAmount,
      total,
    };
  }

  static async deleteInvoice(id: string, userId: string) {
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!existingInvoice) {
      throw new Error('Invoice not found or does not belong to user');
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return true;
  }

  static async markInvoiceAsPaid(id: string, userId: string) {
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!existingInvoice) {
      throw new Error('Invoice not found or does not belong to user');
    }

    const subtotal = existingInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatRate = Number(existingInvoice.vatRate) || 0.15;
    const total = subtotal + Math.round(subtotal * vatRate);

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'paid' as any, 
      },
      include: {
        client: true,
        items: true,
      },
    });

    await prisma.payment.create({
      data: {
        amount: total,
        method: 'OTHER',
        paymentDate: new Date(),
        // Fix: Use connect for relation
        invoice: { connect: { id } },
        user: { connect: { id: userId } },
      },
    });

    return {
      ...updatedInvoice,
      subtotal,
      total,
      vatAmount: total - subtotal,
    };
  }

  /**
   * Calculate invoice totals from items
   */
  static calculateInvoiceTotals(items: Array<{ quantity: number; unitPrice: number }>) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatRate = 0.15; // Default VAT rate
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      total,
    };
  }
}