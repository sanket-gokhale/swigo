import { body } from 'express-validator';

export const validateReview = [
  body('property').notEmpty().withMessage('Property ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
];