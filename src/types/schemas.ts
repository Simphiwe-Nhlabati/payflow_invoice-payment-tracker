import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional(),
});

// Client validation schemas
export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  vatNumber: z.string().optional(),
});

// Invoice validation schemas
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().int().nonnegative('Unit price must be a non-negative integer (in cents)'),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
  currency: z.string().min(1, 'Currency is required'),
  vatRate: z.number().min(0).max(100, 'VAT rate must be between 0 and 100').optional().default(15), // Default to 15%
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
}).refine((data) => {
  // Convert dates to comparable format for validation
  const issueDate = typeof data.issueDate === 'string' ? new Date(data.issueDate) : data.issueDate;
  const dueDate = typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate;
  return dueDate >= issueDate;
}, {
  message: 'Due date must be after issue date',
  path: ['dueDate'],
});

export const updateInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required').optional(),
  invoiceNumber: z.string().optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  vatRate: z.number().min(0).max(100, 'VAT rate must be between 0 and 100').optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').optional(),
}).partial(); // Allow partial updates

// Payment validation schemas
export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().int().positive('Amount must be a positive integer (in cents)'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  method: z.enum(['cash', 'bank_transfer', 'credit_card', 'paypal', 'payfast', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  businessName: z.string().optional(),
});

export const payfastProcessSchema = z.object({
  invoiceId: z.string().uuid('Invoice ID must be a valid UUID'),
  amount: z.number().positive('Amount must be a positive number'),
});