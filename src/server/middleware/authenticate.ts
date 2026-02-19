import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import type { AuthenticatedRequest } from '../types/express';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Attach user and userId to request object
    req.user = user as any;
    req.userId = user.id;

    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Invalid or expired access token') {
      return next(new AppError('Invalid or expired access token', 401));
    }
    
    return next(new AppError('Authentication failed', 500));
  }
};

export default authenticate;