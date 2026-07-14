import { Review } from '../types/review';

let reviews: Review[] = [];
export function setReviews(items: Review[]) { reviews = items; }
export function getReviews() { return reviews; }
