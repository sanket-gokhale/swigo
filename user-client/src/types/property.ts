export interface Property {
  _id: string;
  title: string;
  name?: string; // fallback if needed
  description: string;
  location: string;
  city?: string; // fallback
  price: number;
  type: 'PG' | 'Flat' | 'Homestay' | 'Hostel' | 'Room';
  amenities: string[];
  contactNumber: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  images: string[];
  averageRating: number;
  reviewCount: number;
  genderPreference: 'Boys' | 'Girls' | 'Mixed';
  electricityBill: 'Paid' | 'Unpaid';
  waterSupplyTime: string;
  waterBill: string;
  maintenance: 'Included' | 'Not Included';
  hasFoodService: boolean;
  foodCharges?: number;
  foodType?: 'Veg' | 'Non-Veg' | 'Both';
  linkedTiffinService?: any;
  createdAt: string;
}
