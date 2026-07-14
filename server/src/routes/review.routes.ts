import { Router } from 'express';
import { addReview, getReviews, getOwnerReviews } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get('/owner', authenticate, authorize(['owner', 'admin']), getOwnerReviews);
router.post('/', authenticate, addReview);
router.get('/:propertyId', getReviews);

export default router;