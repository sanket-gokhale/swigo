import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Something went wrong!',
    stack: NODE_ENV === 'development' ? err.stack : undefined
  });
};