import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { USER_ROLES } from '../constants/roles';

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};