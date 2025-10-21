import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile.bind(userController));
router.patch('/profile', userController.updateProfile.bind(userController));
router.get('/check-alias', userController.checkAliasAvailability.bind(userController));

// Settings routes
router.patch('/notifications', userController.updateNotifications.bind(userController));
router.patch('/accessibility', userController.updateAccessibility.bind(userController));
router.patch('/privacy', userController.updatePrivacy.bind(userController));

// Data management routes
router.get('/export', userController.requestDataExport.bind(userController));
router.delete('/account', userController.deleteAccount.bind(userController));

export default router;

