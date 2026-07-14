import { Router } from 'express';
import { getProfile, updateProfile, getOwnerDashboardStats } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/owner-stats', authenticate, getOwnerDashboardStats);

export default router;