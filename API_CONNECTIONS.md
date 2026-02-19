# API Connection Guide

This document outlines how the frontend connects to the backend API endpoints in the PayFlow application.

## Base Configuration

The API connection is configured in `src/client/api/api.ts` with the following settings:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});
```

Make sure to set the `VITE_API_URL` environment variable in your `.env` file for different environments.

## Available API Services

### Authentication API (`authApi`)
- `authApi.register(userData)` - Register a new user
- `authApi.login(credentials)` - Login with email/password
- `authApi.getProfile()` - Get current user profile
- `authApi.updateProfile(updateData)` - Update user profile
- `authApi.logout()` - Logout user

### Client API (`clientApi`)
- `clientApi.getAll(filters?)` - Get all clients with optional filters
- `clientApi.getById(id)` - Get a specific client
- `clientApi.create(clientData)` - Create a new client
- `clientApi.update(id, clientData)` - Update a client
- `clientApi.delete(id)` - Delete a client

### Invoice API (`invoiceApi`)
- `invoiceApi.getAll(filters?)` - Get all invoices with optional filters
- `invoiceApi.getById(id)` - Get a specific invoice
- `invoiceApi.create(invoiceData)` - Create a new invoice
- `invoiceApi.update(id, invoiceData)` - Update an invoice
- `invoiceApi.delete(id)` - Delete an invoice
- `invoiceApi.markAsPaid(id)` - Mark an invoice as paid

### Payment API (`paymentApi`)
- `paymentApi.getAll(filters?)` - Get all payments with optional filters
- `paymentApi.getById(id)` - Get a specific payment
- `paymentApi.create(paymentData)` - Create a new payment
- `paymentApi.update(id, paymentData)` - Update a payment
- `paymentApi.delete(id)` - Delete a payment
- `paymentApi.processPayFast(data)` - Process payment via PayFast

## Common Data Types

### Money Handling
All monetary values are stored as integers representing cents to avoid floating-point precision issues.

### Authentication
The API automatically includes JWT tokens from localStorage in the Authorization header for protected routes. Unauthorized responses (401) trigger automatic logout and redirect to the login page.

## Error Handling
- Network errors and server errors are handled by the axios interceptors
- 401 errors trigger automatic logout
- Validation errors are returned by the backend with appropriate error messages

## Example Usage

```typescript
import { invoiceApi } from './api';

// Get all invoices
const fetchInvoices = async () => {
  try {
    const response = await invoiceApi.getAll();
    console.log(response.data.data.invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
};

// Create a new invoice
const createInvoice = async (invoiceData) => {
  try {
    const response = await invoiceApi.create(invoiceData);
    console.log('Invoice created:', response.data.data.invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
  }
};
```