export interface Review {
  id: string;
  user?: string; // Changed from userId to user (ObjectId)
  property?: string; // Changed from propertyId to property (ObjectId)
  author: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}
