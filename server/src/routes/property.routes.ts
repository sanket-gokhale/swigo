import { Router } from 'express';
import { getProperties, getPropertyById, addProperty, getMyProperties, updateProperty, deleteProperty, getOwnerStats, getCities } from '../controllers/property.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { upload, uploadToCloudinary } from '../middlewares/upload.middleware';

const router = Router();

// Owner/Admin Only: Manage properties
router.get('/owner/stats', authenticate, authorize(['owner', 'admin']), getOwnerStats);
router.get('/my-properties', authenticate, authorize(['owner', 'admin']), getMyProperties);

// Public: Browse properties
router.get('/cities', getCities);
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticate, authorize(['owner', 'admin']), upload.array('images', 5), uploadToCloudinary, addProperty);
router.put('/:id', authenticate, authorize(['owner', 'admin']), upload.array('images', 5), uploadToCloudinary, updateProperty);
router.delete('/:id', authenticate, authorize(['owner', 'admin']), deleteProperty);

export default router;