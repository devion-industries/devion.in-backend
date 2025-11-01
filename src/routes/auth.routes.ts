import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter, aliasCheckRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Public routes with rate limiting
router.post('/signup', authRateLimiter, authController.signup.bind(authController));
router.post('/login', authRateLimiter, authController.login.bind(authController));
router.post('/refresh', authRateLimiter, authController.refreshToken);
router.get('/check-alias', aliasCheckRateLimiter, authController.checkAliasAvailability.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.patch('/profile', authenticate, authController.updateProfile);
router.post('/complete-onboarding', authenticate, authController.completeOnboarding);

export default router;

