export interface IBooking {
  id: string;
  user: string;
  property: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
}