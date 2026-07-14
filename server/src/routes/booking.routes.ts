import { Router } from 'express';
import { requestBooking, getBookings, getIncomingRequests, updateRequestStatus } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// User: Request a booking
router.post('/', authenticate, requestBooking);

// User: Get my own bookings
router.get('/user', authenticate, getBookings);

// Owner: Get incoming requests for my properties
router.get('/owner/requests', authenticate, authorize(['owner', 'admin']), getIncomingRequests);

// Owner: Accept/Reject request
router.patch('/:id/status', authenticate, authorize(['owner', 'admin']), updateRequestStatus);

export default router;