import type{ Request, Response, NextFunction } from 'express';
import { httpLogger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capture the original res.end method to log after response is sent
  const originalEnd = res.end;
  
  res.end = function(chunk: any, encoding: any, callback: any) {
    const duration = Date.now() - startTime;
    
    // Log the request details
    httpLogger.info(`${req.ip} - "${req.method} ${req.path}" ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};