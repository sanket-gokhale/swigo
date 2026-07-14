import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateOwnerStatus,
  getOwnerProperties,
  updateTiffinStatus,
  getTiffinMenuAndReviews,
  getProperties,
  updatePropertyAdmin,
  deletePropertyAdmin,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getBookings,
  updateBookingStatusAdmin,
  getMeals,
  getCollabs,
  updateCollabStatusAdmin,
  getCollabChat,
  getReviewsAdmin,
  deleteReviewAdmin,
  generateReport,
  getNotifications,
  createNotification,
  getTickets,
  createTicket,
  resolveTicket,
  deleteTicket,
  getSettings,
  updateSettings,
  getOtps,
  createOtpAdmin,
  deleteOtpAdmin,
  seedAdminData
} from '../controllers/admin.controller';

const router = Router();

// Inline Admin role check
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrators only.' });
  }
};

// Seed route is public for easy developer setup
router.post('/seed', seedAdminData);

// Secured administrative endpoints
router.get('/stats', authenticate, isAdmin, getStats);
router.get('/users', authenticate, isAdmin, getUsers);
router.put('/users/:id', authenticate, isAdmin, updateUser);
router.delete('/users/:id', authenticate, isAdmin, deleteUser);
router.post('/users/:id/reset-password', authenticate, isAdmin, resetUserPassword);

router.put('/owners/:id/status', authenticate, isAdmin, updateOwnerStatus);
router.get('/owners/:id/properties', authenticate, isAdmin, getOwnerProperties);

router.put('/tiffins/:id/status', authenticate, isAdmin, updateTiffinStatus);
router.get('/tiffins/:id/details', authenticate, isAdmin, getTiffinMenuAndReviews);

router.get('/properties', authenticate, isAdmin, getProperties);
router.put('/properties/:id', authenticate, isAdmin, updatePropertyAdmin);
router.delete('/properties/:id', authenticate, isAdmin, deletePropertyAdmin);

router.get('/rooms', authenticate, isAdmin, getRooms);
router.post('/rooms', authenticate, isAdmin, createRoom);
router.put('/rooms/:id', authenticate, isAdmin, updateRoom);
router.delete('/rooms/:id', authenticate, isAdmin, deleteRoom);

router.get('/bookings', authenticate, isAdmin, getBookings);
router.put('/bookings/:id/status', authenticate, isAdmin, updateBookingStatusAdmin);

router.get('/meals', authenticate, isAdmin, getMeals);

router.get('/collabs', authenticate, isAdmin, getCollabs);
router.get('/collabs/chat', authenticate, isAdmin, getCollabChat);
router.put('/collabs/:id/status', authenticate, isAdmin, updateCollabStatusAdmin);

router.get('/reviews', authenticate, isAdmin, getReviewsAdmin);
router.delete('/reviews/:id', authenticate, isAdmin, deleteReviewAdmin);

router.get('/reports/:type', authenticate, isAdmin, generateReport);

router.get('/notifications', authenticate, isAdmin, getNotifications);
router.post('/notifications', authenticate, isAdmin, createNotification);

router.get('/tickets', authenticate, isAdmin, getTickets);
router.post('/tickets', authenticate, isAdmin, createTicket);
router.put('/tickets/:id/resolve', authenticate, isAdmin, resolveTicket);
router.delete('/tickets/:id', authenticate, isAdmin, deleteTicket);

router.get('/settings', authenticate, isAdmin, getSettings);
router.put('/settings', authenticate, isAdmin, updateSettings);

router.get('/otps', authenticate, isAdmin, getOtps);
router.post('/otps', authenticate, isAdmin, createOtpAdmin);
router.delete('/otps/:id', authenticate, isAdmin, deleteOtpAdmin);

export default router;
