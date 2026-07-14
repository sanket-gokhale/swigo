export interface Property {
  id: string;
  title: string;
  description?: string;
  location?: string;
  price?: number;
  images?: string[];
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
}
