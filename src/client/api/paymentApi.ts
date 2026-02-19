import api from './api';

export interface Payment {
  id: string;
  invoiceId: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    clientId: string;
    client: {
      id: string;
      name: string;
    };
    total: number; // Stored as cents
  };
  amount: number; // Stored as cents
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'payfast' | 'other';
  paymentDate: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PaymentFilters {
  invoiceId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentsResponse {
  success: boolean;
  message: string;
  data: {
    payments: Payment[];
  };
}

export interface SinglePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
  };
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number; // Stored as cents
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'payfast' | 'other';
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export interface PayFastProcessData {
  invoiceId: string;
  amount: number;
}

export const paymentApi = {
  getAll: (filters?: PaymentFilters) => {
    const params = new URLSearchParams();
    if (filters?.invoiceId) params.append('invoiceId', filters.invoiceId);
    if (filters?.method) params.append('method', filters.method);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get<PaymentsResponse>('/payments', { params });
  },

  getById: (id: string) => {
    return api.get<SinglePaymentResponse>(`/payments/${id}`);
  },

  create: (paymentData: CreatePaymentData) => {
    return api.post<SinglePaymentResponse>('/payments', paymentData);
  },

  update: (id: string, paymentData: UpdatePaymentData) => {
    return api.put<SinglePaymentResponse>(`/payments/${id}`, paymentData);
  },

  delete: (id: string) => {
    return api.delete(`/payments/${id}`);
  },

  processPayFast: (data: PayFastProcessData) => {
    return api.post<SinglePaymentResponse>('/payments/payfast/process', data);
  },
};