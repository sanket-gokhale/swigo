import { Router } from 'express';
import { getTiffins, getTiffinById, getMyTiffin, addTiffin, updateTiffin, expressInterest, getIncomingInterests, updateInterest, getMyInterests } from '../controllers/tiffin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload, uploadToCloudinary } from '../middlewares/upload.middleware';

const router = Router();

// Public: Browse tiffin services
router.get('/', getTiffins);
router.get('/my-service', authenticate, authorize(['tiffin']), getMyTiffin);
router.get('/:id', getTiffinById);

// Authenticated: Express interest (User only)
router.post('/interest', authenticate, expressInterest);
router.get('/user/interests', authenticate, getMyInterests);

// Tiffin Provider Only: Manage service and interests
router.get('/provider/interests', authenticate, authorize(['tiffin', 'admin']), getIncomingInterests);
router.patch('/interest/:id', authenticate, authorize(['tiffin', 'admin']), updateInterest);
router.post('/', authenticate, authorize(['tiffin', 'admin']), upload.array('images', 5), uploadToCloudinary, addTiffin);
router.put('/:id', authenticate, authorize(['tiffin', 'admin']), upload.array('images', 5), uploadToCloudinary, updateTiffin);

export default router;