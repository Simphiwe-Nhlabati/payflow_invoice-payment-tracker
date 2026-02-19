/*
 * Sample Usage Guide for API Services
 * This file demonstrates how to use the API services in React components
 */

import { useState, useEffect } from 'react';
import { 
  clientApi, 
  invoiceApi, 
  paymentApi, 
  authApi,
  type Client,
  type Invoice,
  type Payment,
  type User
} from '../api';


// Example: Fetch and display clients
const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clientApi.getAll();
        setClients(response.data.data.clients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loading, error };
};

// Example: Create a new client
const createNewClient = async (clientData) => {
  try {
    const response = await clientApi.create(clientData);
    console.log('Client created:', response.data.data.client);
    return response.data.data.client;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

// Example: Fetch and display invoices
const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await invoiceApi.getAll();
        setInvoices(response.data.data.invoices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return { invoices, loading, error };
};

// Example: Create a new invoice
const createNewInvoice = async (invoiceData) => {
  try {
    const response = await invoiceApi.create(invoiceData);
    console.log('Invoice created:', response.data.data.invoice);
    return response.data.data.invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Example: Fetch and display payments
const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await paymentApi.getAll();
        setPayments(response.data.data.payments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return { payments, loading, error };
};

// Example: Process a payment
const processPayment = async (paymentData) => {
  try {
    const response = await paymentApi.create(paymentData);
    console.log('Payment processed:', response.data.data.payment);
    return response.data.data.payment;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Example: Get current user profile
const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authApi.getProfile();
        setUser(response.data.data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { user, loading, error };
};

export {
  useClients,
  createNewClient,
  useInvoices,
  createNewInvoice,
  usePayments,
  processPayment,
  useCurrentUser
};