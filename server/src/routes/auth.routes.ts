import { Router } from 'express';
import { registerUser, loginUser, forgotPasswordController, resetPasswordController } from '../controllers/auth.controller';
import { validateAuth } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateAuth, registerUser);
router.post('/login', validateAuth, loginUser);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;