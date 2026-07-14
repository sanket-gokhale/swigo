import { Router } from 'express';
import { getHistory, sendMsg } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:partnerId', authenticate, getHistory);
router.post('/', authenticate, sendMsg);

export default router;
