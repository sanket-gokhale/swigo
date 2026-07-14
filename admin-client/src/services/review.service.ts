import { getJSON, postAuthJSON } from './api';
import { Review } from '../types/review';

export async function fetchReviews(propertyId?: string): Promise<Review[]> {
  const response = await getJSON(propertyId ? `/reviews/${propertyId}` : '/reviews');
  return response.data;
}

export async function postReview(payload: Partial<Review>) {
  return postAuthJSON('/reviews', payload);
}
