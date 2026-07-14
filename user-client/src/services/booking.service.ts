import { postAuthJSON } from './api';
import { Booking } from '../types/booking';

export async function createBooking(data: any) {
  return postAuthJSON('/bookings', data);
}
