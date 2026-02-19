import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { AppError } from '../utils/AppError';
import { validateRequest } from '../middleware/validateRequest';
import { clientSchema } from '../../types/schemas';
import { ClientService } from '../services/clientService';
import type { AuthenticatedRequest } from '../types/express';

const router = Router();

// Get all clients for the authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if the original URL has a trailing slash after the resource name (meaning /clients/)
  if (req.originalUrl === '/clients/') {
    const appError = new AppError('Invalid client ID', 400);
    return next(appError);
  }
  
  try {
    const userId = req.userId!;
    const { search } = req.query;

    const filters = {
      userId,
      search: search as string,
    };

    const clients = await ClientService.getAllClients(filters);

    res.status(200).json({
      success: true,
      message: 'Clients retrieved successfully',
      data: { clients },
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific client
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Validate client ID format
    if (!clientId || typeof clientId !== 'string' || clientId.length === 0) {
      throw new AppError('Invalid client ID', 400);
    }

    const client = await ClientService.getClientById(clientId, userId);

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Client retrieved successfully',
      data: { client },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new client
router.post('/', authenticate, validateRequest(clientSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const clientData = req.body;

    const client = await ClientService.createClient(userId, clientData);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client },
    });
  } catch (error) {
    next(error);
  }
});

// Update a client
router.put('/:id', authenticate, validateRequest(clientSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clientData = req.body;

    const updatedClient = await ClientService.updateClient(clientId, userId, clientData);

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: { client: updatedClient },
    });
  } catch (error) {
    next(error);
  }
});

// Delete a client
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await ClientService.deleteClient(clientId, userId);

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;