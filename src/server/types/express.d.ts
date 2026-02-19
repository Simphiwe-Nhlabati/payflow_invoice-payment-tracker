import type { Request, Response } from 'express';
import type { ParsedQs } from 'qs';
import type { User } from '../../types/models';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
}
