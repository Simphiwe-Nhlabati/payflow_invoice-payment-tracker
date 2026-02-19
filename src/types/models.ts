// User-related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Client-related types
export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  vatNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  vatNumber?: string;
}

// Invoice-related types
export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  subtotal: number; // Amount in cents
  taxAmount: number; // Amount in cents
  total: number; // Amount in cents
  vatRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: Date | null;
  items: InvoiceItem[];
  client: Client;
}

export interface CreateInvoiceData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  vatRate: number;
  invoiceNumber?: string;
  notes?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number; // Price in cents
  total: number; // Total in cents
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
}

// Payment-related types
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number; // Amount in cents
  paymentDate: string;
  method: 'EFT' | 'CREDIT_CARD' | 'PAYPAL' | 'OTHER';
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number; // Amount in cents
  paymentDate: string;
  method: 'EFT' | 'CREDIT_CARD' | 'PAYPAL' | 'OTHER';
  reference?: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}