import { Router } from 'express';
import { sendRequest, getMyRequestsAsOwner, getMyRequestsAsProvider, updateStatus } from '../controllers/collab.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.post('/', authenticate, authorize(['tiffin', 'owner', 'admin']), sendRequest);
router.get('/owner', authenticate, authorize(['owner', 'admin']), getMyRequestsAsOwner);
router.get('/provider', authenticate, authorize(['tiffin', 'admin']), getMyRequestsAsProvider);
router.patch('/:id', authenticate, authorize(['tiffin', 'owner', 'admin']), updateStatus);

export default router;
