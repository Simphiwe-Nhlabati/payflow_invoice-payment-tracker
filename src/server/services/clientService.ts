// Use local types and Prisma for database operations
import type { CreateClientData } from '../../types/models';
import { Prisma } from '@prisma/client';
// Use the shared prisma instance
import { prisma } from '../utils/prisma';

interface ClientFilters {
  userId: string;
  search?: string;
}

export class ClientService {
  /**
   * Get all clients for a user with optional search
   */
  static async getAllClients(filters: ClientFilters) {
    const { userId, search } = filters;

    const whereClause: Prisma.ClientWhereInput = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return clients;
  }

  /**
   * Get a specific client by ID
   */
  static async getClientById(id: string, userId: string) {
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId,
      },
    });

    return client;
  }

  /**
   * Create a new client
   */
  static async createClient(userId: string, data: CreateClientData) {
    // Check if client with email already exists for this user
    const existingClient = await prisma.client.findFirst({
      where: {
        email: data.email,
        userId,
      },
    });

    if (existingClient) {
      throw new Error('A client with this email already exists');
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        userId,
      },
    });

    return client;
  }

  /**
   * Update an existing client
   */
  static async updateClient(id: string, userId: string, data: Partial<CreateClientData>) {
    // Verify that the client exists and belongs to the user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingClient) {
      throw new Error('Client not found or does not belong to user');
    }

    // Check if email is being updated and if it conflicts with another client
    if (data.email && data.email !== existingClient.email) {
      const duplicateEmailClient = await prisma.client.findFirst({
        where: {
          email: data.email,
          userId,
          id: { not: id }, // Exclude current client
        },
      });

      if (duplicateEmailClient) {
        throw new Error('A client with this email already exists');
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data,
    });

    return updatedClient;
  }

  /**
   * Delete a client
   */
  static async deleteClient(id: string, userId: string) {
    // Verify that the client exists and belongs to the user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingClient) {
      throw new Error('Client not found or does not belong to user');
    }

    // Check if client has any invoices associated with it
    const invoiceCount = await prisma.invoice.count({
      where: {
        clientId: id,
      },
    });

    if (invoiceCount > 0) {
      throw new Error('Cannot delete client with associated invoices');
    }

    // Delete the client
    await prisma.client.delete({
      where: { id },
    });

    return true;
  }
}