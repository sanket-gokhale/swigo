import { body } from 'express-validator';

export const validateBooking = [
  body('property').notEmpty().withMessage('Property ID is required'),
  body('checkIn').isISO8601().withMessage('Invalid check-in date'),
  body('checkOut').isISO8601().withMessage('Invalid check-out date'),
];