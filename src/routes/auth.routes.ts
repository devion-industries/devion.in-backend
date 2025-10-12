import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;

