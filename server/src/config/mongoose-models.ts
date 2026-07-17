import mongoose, { Schema, model } from 'mongoose';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

// 1. User Schema
const UserSchema = new Schema({
  _id: { type: String, default: uuid },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // user | owner | tiffin | admin
  phone: { type: String, default: null },
  city: { type: String, default: 'Pune' },
  bio: { type: String, default: '' },
  businessName: { type: String, default: '' },
  kitchenName: { type: String, default: '' },
  rating: { type: Number, default: 4.5 },
  status: { type: String, default: 'Active' }, // Active | Suspended | Pending
  otp: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 2. Property Schema
const PropertySchema = new Schema({
  _id: { type: String, default: uuid },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: null },
  city: { type: String, required: true, index: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  coordinates: { type: Schema.Types.Mixed, default: null }, // GeoJSON Point
  price: { type: Number, required: true },
  type: { type: String, default: 'PG' }, // PG | Flat | Homestay | Hostel | Room
  amenities: { type: [String], default: [] },
  contactNumber: { type: String, required: true },
  ownerId: { type: String, ref: 'User', required: true },
  images: { type: [String], default: [] },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  genderPreference: { type: String, default: 'Mixed' }, // Boys | Girls | Mixed
  electricityBill: { type: String, default: 'Unpaid' }, // Paid | Unpaid
  waterSupplyTime: { type: String, default: '24/7' },
  waterBill: { type: String, default: 'Included' },
  maintenance: { type: String, default: 'Included' }, // Included | Not Included
  hasFoodService: { type: Boolean, default: false },
  linkedTiffinId: { type: String, ref: 'Tiffin', default: null },
  foodCharges: { type: Number, default: null },
  foodType: { type: String, default: null }, // Veg | Non-Veg | Both
  status: { type: String, default: 'Approved' }, // Pending | Approved | Hidden
  createdAt: { type: Date, default: Date.now }
}, { 
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PropertySchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'propertyId'
});

// 3. Room Schema
const RoomSchema = new Schema({
  _id: { type: String, default: uuid },
  roomNo: { type: String, required: true },
  propertyId: { type: String, ref: 'Property', required: true },
  type: { type: String, default: 'Single' }, // Single | Double | Triple | Shared
  price: { type: Number, required: true },
  availability: { type: String, default: 'Available' }, // Available | Occupied | Maintenance
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 4. BookingRequest Schema
const BookingRequestSchema = new Schema({
  _id: { type: String, default: uuid },
  userId: { type: String, ref: 'User', required: true },
  propertyId: { type: String, ref: 'Property', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  visitTime: { type: String, default: null },
  message: { type: String, default: null },
  rejectionReason: { type: String, default: null },
  status: { type: String, default: 'pending' }, // pending | approved | confirmed | accepted | rejected
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 5. Tiffin Schema
const TiffinSchema = new Schema({
  _id: { type: String, default: uuid },
  name: { type: String, required: true },
  description: { type: String, required: true },
  city: { type: String, required: true, index: true },
  area: { type: String, required: true },
  coordinates: { type: Schema.Types.Mixed, default: null },
  price: { type: Number, required: true },
  providerId: { type: String, ref: 'User', required: true },
  images: { type: [String], default: [] },
  mealPlans: { type: Schema.Types.Mixed, default: null },
  deliveryAreas: { type: [String], default: [] },
  menu: { type: Schema.Types.Mixed, default: null },
  isStandalone: { type: Boolean, default: true },
  type: { type: String, default: 'independent' }, // owner-collab | independent
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 6. TiffinInterest Schema
const TiffinInterestSchema = new Schema({
  _id: { type: String, default: uuid },
  userId: { type: String, ref: 'User', required: true },
  tiffinId: { type: String, ref: 'Tiffin', required: true },
  message: { type: String, default: null },
  status: { type: String, default: 'pending' }, // pending | contacted | completed
  requestType: { type: String, default: 'independent' }, // property-linked | independent
  planSelected: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 7. CollabRequest Schema
const CollabRequestSchema = new Schema({
  _id: { type: String, default: uuid },
  tiffinId: { type: String, ref: 'Tiffin', required: true },
  propertyId: { type: String, ref: 'Property', required: true },
  ownerId: { type: String, ref: 'User', required: true },
  providerId: { type: String, ref: 'User', required: true },
  status: { type: String, default: 'pending' }, // pending | accepted | rejected | cancelled
  initiatedBy: { type: String, required: true }, // owner | provider
  message: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 8. Review Schema
const ReviewSchema = new Schema({
  _id: { type: String, default: uuid },
  userId: { type: String, ref: 'User', required: true },
  propertyId: { type: String, ref: 'Property', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 9. Message Schema
const MessageSchema = new Schema({
  _id: { type: String, default: uuid },
  senderId: { type: String, ref: 'User', required: true },
  receiverId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, default: 'text' }, // text | meal_details | pricing
  mealDetails: { type: Schema.Types.Mixed, default: null },
  pricingDetails: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 10. Notification Schema
const NotificationSchema = new Schema({
  _id: { type: String, default: uuid },
  type: { type: String, required: true }, // announcement | maintenance | update | warning
  targetGroup: { type: String, required: true }, // all | owners | users | tiffin
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 11. SupportTicket Schema
const SupportTicketSchema = new Schema({
  _id: { type: String, default: uuid },
  title: { type: String, required: true },
  description: { type: String, required: true },
  senderId: { type: String, ref: 'User', required: true },
  category: { type: String, required: true }, // user | owner | kitchen
  status: { type: String, default: 'open' }, // open | resolved
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 12. SystemSetting Schema
const SystemSettingSchema = new Schema({
  _id: { type: String, default: uuid },
  platformName: { type: String, default: 'Swigo' },
  logoUrl: { type: String, default: '/logo.png' },
  theme: { type: String, default: 'light' },
  emailHost: { type: String, default: 'smtp.gmail.com' },
  jwtExpiration: { type: String, default: '7d' },
  cloudStorageBucket: { type: String, default: 'swigo-media-bucket' },
  locationDefaultCity: { type: String, default: 'Pune' },
  userPortalMaintenance: { type: Boolean, default: false },
  ownerPortalMaintenance: { type: Boolean, default: false },
  tiffinPortalMaintenance: { type: Boolean, default: false },
  adminPortalMaintenance: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// 13. Otp Schema
const OtpSchema = new Schema({
  _id: { type: String, default: uuid },
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { versionKey: false });

export const UserModel = mongoose.models.User || model('User', UserSchema, 'users');
export const PropertyModel = mongoose.models.Property || model('Property', PropertySchema, 'properties');
export const RoomModel = mongoose.models.Room || model('Room', RoomSchema, 'rooms');
export const BookingRequestModel = mongoose.models.BookingRequest || model('BookingRequest', BookingRequestSchema, 'booking_requests');
export const TiffinModel = mongoose.models.Tiffin || model('Tiffin', TiffinSchema, 'tiffins');
export const TiffinInterestModel = mongoose.models.TiffinInterest || model('TiffinInterest', TiffinInterestSchema, 'tiffin_interests');
export const CollabRequestModel = mongoose.models.CollabRequest || model('CollabRequest', CollabRequestSchema, 'collab_requests');
export const ReviewModel = mongoose.models.Review || model('Review', ReviewSchema, 'reviews');
export const MessageModel = mongoose.models.Message || model('Message', MessageSchema, 'messages');
export const NotificationModel = mongoose.models.Notification || model('Notification', NotificationSchema, 'notifications');
export const SupportTicketModel = mongoose.models.SupportTicket || model('SupportTicket', SupportTicketSchema, 'support_tickets');
export const SystemSettingModel = mongoose.models.SystemSetting || model('SystemSetting', SystemSettingSchema, 'system_settings');
export const OtpModel = mongoose.models.Otp || model('Otp', OtpSchema, 'otps');
