import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ZodSchema } from 'zod';
import AppError from '../utils/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let validatedData;
      
      // First, try to validate just the body (most common case)
      try {
        validatedData = schema.parse(req.body);
        req.body = validatedData;
      } catch (bodyError) {
        // If body validation fails, try the combined object approach
        const requestData = {
          body: req.body,
          query: req.query,
          params: req.params,
        };
        
        validatedData = schema.parse(requestData);
        
        // Attach validated data to request object
        req.body = validatedData.body;
        req.query = validatedData.query;
        req.params = validatedData.params;
      }

      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        const appError = new AppError(
          'Validation Error',
          400,
          true,
          errors
        );

        return next(appError);
      }

      // Handle other types of errors
      const appError = new AppError(
        'Validation Error',
        400,
        true,
        [{ message: 'Invalid request data' }]
      );

      return next(appError);
    }
  };
};

export default validateRequest;