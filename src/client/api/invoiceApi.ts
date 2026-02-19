import api from './api';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // Stored as cents
  total: number; // Stored as cents
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    vatNumber?: string;
  };
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  subtotal: number; // Stored as cents
  vatAmount: number; // Stored as cents
  total: number; // Stored as cents
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  items: InvoiceItem[];
}

export interface InvoiceFilters {
  status?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
}

export interface InvoicesResponse {
  success: boolean;
  message: string;
  data: {
    invoices: Invoice[];
  };
}

export interface SingleInvoiceResponse {
  success: boolean;
  message: string;
  data: {
    invoice: Invoice;
  };
}

export interface CreateInvoiceData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number; // Stored as cents
  }>;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {}

export const invoiceApi = {
  getAll: (filters?: InvoiceFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get<InvoicesResponse>('/invoices', { params });
  },

  getById: (id: string) => {
    return api.get<SingleInvoiceResponse>(`/invoices/${id}`);
  },

  create: (invoiceData: CreateInvoiceData) => {
    return api.post<SingleInvoiceResponse>('/invoices', invoiceData);
  },

  update: (id: string, invoiceData: UpdateInvoiceData) => {
    return api.put<SingleInvoiceResponse>(`/invoices/${id}`, invoiceData);
  },

  delete: (id: string) => {
    return api.delete(`/invoices/${id}`);
  },

  markAsPaid: (id: string) => {
    return api.patch<SingleInvoiceResponse>(`/invoices/${id}/mark-paid`);
  },
};