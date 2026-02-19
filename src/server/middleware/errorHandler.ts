import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError'; // Fixed import path
import { logger } from '../utils/logger';

// Global error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // Log the error for debugging
  logger.error(`Error occurred: ${err.message}`, {
    url: req.url,
    method: req.method,
    params: req.params,
    body: req.body,
    timestamp: new Date().toISOString(),
    error: err.stack
  });

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }
  // Handle validation errors (Zod, etc.)
  else if ((err as any).issues) {
    // Zod validation error structure
    statusCode = 400;
    message = 'Validation Error';
    errors = (err as any).issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
      value: issue.input
    }));
  }
  else if ((err as any).validationErrors) {
    statusCode = 400;
    message = 'Validation Error';
    errors = (err as any).validationErrors;
  }
  // Handle Prisma errors
  else if ((err as any).code) {
    // Common Prisma error codes
    switch ((err as any).code) {
      case 'P2002': // Unique constraint failed
        statusCode = 409;
        message = 'Resource already exists';
        errors = [{ field: (err as any).meta?.target?.join(', ') || 'unknown', message: 'Unique constraint violation' }];
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003': // Foreign key constraint failed
        statusCode = 400;
        message = 'Referenced resource does not exist';
        errors = [{ field: (err as any).meta?.field_name || 'unknown', message: 'Foreign key constraint violation' }];
        break;
      case 'P2014': // A constraint failed on the update
        statusCode = 400;
        message = 'Update violates constraint';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }
  }
  // Handle JSON parsing errors
  else if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON format';
  }
  // Handle Mongoose validation errors
  else if ((err as any).name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.keys((err as any).errors).map(field => ({
      field,
      message: (err as any).errors[field].message
    }));
  }
  // Handle CastError (Mongoose)
  else if ((err as any).name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errors = [{
      field: (err as any).path,
      message: `Invalid value '${(err as any).value}' for field '${(err as any).path}'`
    }];
  }
  // Handle authentication errors
  else if ((err as any).name === 'UnauthorizedError' || statusCode === 401) {
    statusCode = 401;
    message = 'Authentication failed';
  }

  // Don't leak stack traces in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack:', err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};