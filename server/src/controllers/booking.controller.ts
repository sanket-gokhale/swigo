import { Response, RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createBookingRequest, getUserBookings, getOwnerRequests, updateBookingStatus } from '../services/booking.service';
import { sendResponse } from '../utils/response';

export const requestBooking = async (req: AuthRequest, res: Response) => {
  try {
    // Attach userId from token
    const bookingData = { ...req.body, user: req.user.id };
    const booking = await createBookingRequest(bookingData);
    sendResponse(res, 201, 'Booking request created', booking);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await getUserBookings(req.user.id);
    sendResponse(res, 200, 'Bookings retrieved', bookings);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getIncomingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await getOwnerRequests(req.user.id);
    sendResponse(res, 200, 'Owner requests retrieved', requests);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const updated = await updateBookingStatus(id, status, rejectionReason);
    sendResponse(res, 200, 'Status updated', updated);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};