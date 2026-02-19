import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { ClientService } from '../../src/server/services/clientService';
import { prisma } from '../../src/server/utils/prisma';

// Mock the prisma instance
vi.mock('../../src/server/utils/prisma', () => ({
  prisma: {
    client: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    invoice: {
      count: vi.fn(),
    },
  },
}));

describe('ClientService', () => {
  const mockUserId = 'user-123';
  const mockClientId = 'client-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllClients', () => {
    it('should return all clients for a user', async () => {
      const mockClients = [
        { id: 'client-1', name: 'Test Client 1', email: 'test1@example.com', userId: mockUserId },
        { id: 'client-2', name: 'Test Client 2', email: 'test2@example.com', userId: mockUserId },
      ];
      
      (prisma.client.findMany as Mock).mockResolvedValue(mockClients);
      
      const result = await ClientService.getAllClients({ userId: mockUserId });
      
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockClients);
    });

    it('should return clients filtered by search term', async () => {
      const searchTerm = 'test';
      const mockFilteredClients = [
        { id: 'client-1', name: 'Test Client', email: 'test@example.com', userId: mockUserId },
      ];
      
      (prisma.client.findMany as Mock).mockResolvedValue(mockFilteredClients);
      
      const result = await ClientService.getAllClients({ 
        userId: mockUserId, 
        search: searchTerm 
      });
      
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { company: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockFilteredClients);
    });
  });

  describe('getClientById', () => {
    it('should return a client if it exists and belongs to the user', async () => {
      const mockClient = { id: mockClientId, name: 'Test Client', email: 'test@example.com', userId: mockUserId };
      
      (prisma.client.findFirst as Mock).mockResolvedValue(mockClient);
      
      const result = await ClientService.getClientById(mockClientId, mockUserId);
      
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockClientId,
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockClient);
    });

    it('should return null if client does not exist', async () => {
      (prisma.client.findFirst as Mock).mockResolvedValue(null);
      
      const result = await ClientService.getClientById('non-existent', mockUserId);
      
      expect(result).toBeNull();
    });
  });

  describe('createClient', () => {
    const mockClientData = {
      name: 'New Client',
      email: 'newclient@example.com',
      company: 'New Company',
      phone: '+27123456789',
      address: '123 Main St',
      city: 'Cape Town',
      country: 'South Africa',
    };

    it('should create a new client if email is unique', async () => {
      (prisma.client.findFirst as Mock).mockResolvedValue(null); // No existing client with this email
      
      const createdClient = {
        id: 'new-client-id',
        ...mockClientData,
        userId: mockUserId,
      };
      
      (prisma.client.create as Mock).mockResolvedValue(createdClient);
      
      const result = await ClientService.createClient(mockUserId, mockClientData);
      
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: {
          email: mockClientData.email,
          userId: mockUserId,
        },
      });
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          ...mockClientData,
          userId: mockUserId,
        },
      });
      expect(result).toEqual(createdClient);
    });

    it('should throw an error if client with email already exists', async () => {
      (prisma.client.findFirst as Mock).mockResolvedValue({
        id: 'existing-client-id',
        email: mockClientData.email,
      });
      
      await expect(ClientService.createClient(mockUserId, mockClientData))
        .rejects
        .toThrow('A client with this email already exists');
    });
  });

  describe('updateClient', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update client if it exists and belongs to the user', async () => {
      const existingClient = {
        id: mockClientId,
        name: 'Old Name',
        email: 'old@example.com',
        userId: mockUserId,
      };
      
      const updatedClient = {
        ...existingClient,
        ...updateData,
      };
      
      (prisma.client.findFirst as Mock)
        .mockResolvedValueOnce(existingClient)  // First call: find existing client
        .mockResolvedValueOnce(null);          // Second call: no duplicate email found
      (prisma.client.update as Mock).mockResolvedValue(updatedClient);

      const result = await ClientService.updateClient(mockClientId, mockUserId, updateData);

      expect(prisma.client.findFirst).toHaveBeenNthCalledWith(1, {
        where: {
          id: mockClientId,
          userId: mockUserId,
        },
      });
      expect(prisma.client.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          email: updateData.email,
          userId: mockUserId,
          id: { not: mockClientId }, // Exclude current client
        },
      });
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: mockClientId },
        data: updateData,
      });
      expect(result).toEqual(updatedClient);
    });

    it('should throw an error if client does not exist', async () => {
      (prisma.client.findFirst as Mock).mockResolvedValue(null);
      
      await expect(ClientService.updateClient(mockClientId, mockUserId, updateData))
        .rejects
        .toThrow('Client not found or does not belong to user');
    });

    it('should throw an error if email conflicts with another client', async () => {
      const existingClient = {
        id: mockClientId,
        name: 'Old Name',
        email: 'old@example.com', // Different from updateData.email
        userId: mockUserId,
      };

      const conflictingClient = {
        id: 'other-client-id',
        email: updateData.email,
      };

      (prisma.client.findFirst as Mock)
        .mockResolvedValueOnce(existingClient)  // First call: find existing client
        .mockResolvedValueOnce(conflictingClient);  // Second call: check for duplicate email

      await expect(ClientService.updateClient(mockClientId, mockUserId, updateData))
        .rejects
        .toThrow('A client with this email already exists');
    });
  });

  describe('deleteClient', () => {
    it('should delete client if it exists, belongs to user, and has no associated invoices', async () => {
      const existingClient = {
        id: mockClientId,
        name: 'Test Client',
        email: 'test@example.com',
        userId: mockUserId,
      };
      
      (prisma.client.findFirst as Mock).mockResolvedValue(existingClient);
      (prisma.invoice.count as Mock).mockResolvedValue(0); // No associated invoices
      (prisma.client.delete as Mock).mockResolvedValue(undefined);
      
      const result = await ClientService.deleteClient(mockClientId, mockUserId);
      
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockClientId,
          userId: mockUserId,
        },
      });
      expect(prisma.invoice.count).toHaveBeenCalledWith({
        where: {
          clientId: mockClientId,
        },
      });
      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: mockClientId },
      });
      expect(result).toBe(true);
    });

    it('should throw an error if client does not exist', async () => {
      (prisma.client.findFirst as Mock).mockResolvedValue(null);
      
      await expect(ClientService.deleteClient(mockClientId, mockUserId))
        .rejects
        .toThrow('Client not found or does not belong to user');
    });

    it('should throw an error if client has associated invoices', async () => {
      const existingClient = {
        id: mockClientId,
        name: 'Test Client',
        email: 'test@example.com',
        userId: mockUserId,
      };
      
      (prisma.client.findFirst as Mock).mockResolvedValue(existingClient);
      (prisma.invoice.count as Mock).mockResolvedValue(1); // Has associated invoices
      
      await expect(ClientService.deleteClient(mockClientId, mockUserId))
        .rejects
        .toThrow('Cannot delete client with associated invoices');
    });
  });
});