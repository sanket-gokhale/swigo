import { useEffect, useState } from 'react';
import { fetchReviews } from '../services/review.service';
import { Review } from '../types/review';

export default function useReviews(propertyId?: string) {
  const [items, setItems] = useState<Review[]>([]);
  useEffect(() => { fetchReviews(propertyId).then(setItems).catch(() => setItems([])); }, [propertyId]);
  return items;
}
