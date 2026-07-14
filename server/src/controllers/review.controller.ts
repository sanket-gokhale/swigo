import { Request, Response, RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as reviewService from '../services/review.service';
import { sendResponse } from '../utils/response';

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    // Attach author from auth token
    const reviewData = { 
      ...req.body, 
      user: req.user.id,
      authorName: req.user.name || 'Anonymous' 
    };
    const review = await reviewService.createReview(reviewData);
    sendResponse(res, 201, 'Review created', review);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getReviews: RequestHandler = async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (propertyId && !propertyId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/) && !propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return sendResponse(res, 200, 'Reviews retrieved', []);
    }
    const reviews = await reviewService.getPropertyReviews(propertyId);
    sendResponse(res, 200, 'Reviews retrieved', reviews);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getOwnerReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await reviewService.getOwnerReviews(req.user.id);
    sendResponse(res, 200, 'Owner reviews retrieved', reviews);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};