import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import clientRoutes from '../../src/server/routes/clients';
import { ClientService } from '../../src/server/services/clientService';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../../src/server/middleware/errorHandler';

// Mock the ClientService
import { vi } from 'vitest';
vi.mock('../../src/server/services/clientService');

// Set up environment variables for JWT
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

const app = express();
app.use(express.json());
app.use('/clients', clientRoutes);
app.use(errorHandler);

describe('Client Routes Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockClient = {
    id: 'client-123',
    name: 'Test Client',
    email: 'client@example.com',
    phone: '+27123456789',
    address: '123 Main St',
    vatNumber: 'VAT123456789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-123',
  };

  const mockToken = jwt.sign({ userId: mockUser.id, email: mockUser.email }, process.env.JWT_SECRET!);

  beforeAll(() => {
    // Mock implementations
    vi.mocked(ClientService.getAllClients).mockResolvedValue([mockClient]);
    vi.mocked(ClientService.getClientById).mockResolvedValue(mockClient);
    vi.mocked(ClientService.createClient).mockResolvedValue(mockClient);
    vi.mocked(ClientService.updateClient).mockResolvedValue(mockClient);
    vi.mocked(ClientService.deleteClient).mockResolvedValue(true);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('GET /clients', () => {
    it('should return all clients for the authenticated user', async () => {
      const response = await request(app)
        .get('/clients')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Clients retrieved successfully');
      expect(response.body.data.clients).toEqual([mockClient]);
    });

    it('should return clients with search filter', async () => {
      const response = await request(app)
        .get('/clients?search=test')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toEqual([mockClient]);
    });
  });

  describe('GET /clients/:id', () => {
    it('should return a specific client', async () => {
      const response = await request(app)
        .get('/clients/client-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Client retrieved successfully');
      expect(response.body.data.client).toEqual(mockClient);
    });

    it('should return 404 for non-existent client', async () => {
      vi.mocked(ClientService.getClientById).mockResolvedValue(null);

      const response = await request(app)
        .get('/clients/non-existent')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Client not found');
    });

    it('should return 400 for invalid client ID', async () => {
      const response = await request(app)
        .get('/clients/')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /clients', () => {
    it('should create a new client', async () => {
      const clientData = {
        name: 'New Client',
        email: 'newclient@example.com',
      };

      const response = await request(app)
        .post('/clients')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Client created successfully');
      expect(response.body.data.client).toEqual(mockClient);
    });

    it('should return 400 for invalid client data', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email
      };

      const response = await request(app)
        .post('/clients')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /clients/:id', () => {
    it('should update a client', async () => {
      const updateData = {
        name: 'Updated Client',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put('/clients/client-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Client updated successfully');
      expect(response.body.data.client).toEqual(mockClient);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email
      };

      const response = await request(app)
        .put('/clients/client-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /clients/:id', () => {
    it('should delete a client', async () => {
      const response = await request(app)
        .delete('/clients/client-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Client deleted successfully');
    });
  });
});