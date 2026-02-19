import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { AppError } from '../utils/AppError';
import { validateRequest } from '../middleware/validateRequest';
import { paymentSchema, payfastProcessSchema } from '../../types/schemas';
import { PaymentService } from '../services/paymentService';
import type { AuthenticatedRequest } from '../types/express';

const router = Router();

// Get all payments for the authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { invoiceId, method, startDate, endDate } = req.query;

    const filters = {
      userId,
      invoiceId: invoiceId as string,
      method: method as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const payments = await PaymentService.getAllPayments(filters);

    res.status(200).json({
      success: true,
      message: 'Payments retrieved successfully',
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific payment
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const payment = await PaymentService.getPaymentById(paymentId, userId);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Payment retrieved successfully',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new payment
router.post('/', authenticate, validateRequest(paymentSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const paymentData = req.body;

    const payment = await PaymentService.createPayment(userId, paymentData);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

// Update a payment
router.put('/:id', authenticate, validateRequest(paymentSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const paymentData = req.body;

    const updatedPayment = await PaymentService.updatePayment(paymentId, userId, paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: { payment: updatedPayment },
    });
  } catch (error) {
    next(error);
  }
});

// Delete a payment
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await PaymentService.deletePayment(paymentId, userId);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Process payment via PayFast (mock implementation)
router.post('/payfast/process', authenticate, validateRequest(payfastProcessSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { invoiceId, amount } = req.body;

    // For PayFast integration, we'll use the payment service to create the payment
    const paymentData = {
      invoiceId,
      amount,
      method: 'other' as const, // PayFast is treated as 'other' payment method
      paymentDate: new Date().toISOString(),
      reference: undefined,
      notes: 'Payment via PayFast',
    };

    const payment = await PaymentService.createPayment(userId, paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully via PayFast',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

export default router;