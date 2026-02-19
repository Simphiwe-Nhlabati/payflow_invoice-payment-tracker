import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { AppError } from '../utils/AppError';
import { validateRequest } from '../middleware/validateRequest';
import { createInvoiceSchema, updateInvoiceSchema } from '../../types/schemas';
import { InvoiceService } from '../services/invoiceService';
import type { AuthenticatedRequest } from '../types/express';

const router = Router();

// Get all invoices for the authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { status, clientId, startDate, endDate } = req.query;

    const filters = {
      userId,
      status: status as string,
      clientId: clientId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const invoices = await InvoiceService.getAllInvoices(filters);

    res.status(200).json({
      success: true,
      message: 'Invoices retrieved successfully',
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific invoice
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const invoiceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const invoice = await InvoiceService.getInvoiceById(invoiceId, userId);

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Invoice retrieved successfully',
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new invoice
router.post('/', authenticate, validateRequest(createInvoiceSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const invoiceData = req.body;

    const invoice = await InvoiceService.createInvoice(userId, invoiceData);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
});

// Update an invoice
router.put('/:id', authenticate, validateRequest(updateInvoiceSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const invoiceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoiceData = req.body;

    const invoice = await InvoiceService.updateInvoice(invoiceId, userId, invoiceData);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
});

// Delete an invoice
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const invoiceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await InvoiceService.deleteInvoice(invoiceId, userId);

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Mark invoice as paid
router.patch('/:id/mark-paid', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const invoiceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const invoice = await InvoiceService.markInvoiceAsPaid(invoiceId, userId);

    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid successfully',
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
});

export default router;