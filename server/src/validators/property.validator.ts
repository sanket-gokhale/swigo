import { body } from 'express-validator';

export const validateProperty = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
];