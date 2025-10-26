import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken);
router.get('/check-alias', authController.checkAliasAvailability.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.patch('/profile', authenticate, authController.updateProfile);
router.post('/complete-onboarding', authenticate, authController.completeOnboarding);

export default router;

