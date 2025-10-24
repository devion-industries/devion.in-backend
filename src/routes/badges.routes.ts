import express from 'express';
import { authenticate } from '../middleware/auth';
import badgesController from '../controllers/badges.controller';

const router = express.Router();

// All badge routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/badges
 * @desc    Get all badges with user progress
 * @access  Private
 */
router.get('/', badgesController.getAllBadges.bind(badgesController));

/**
 * @route   GET /api/badges/unlocked
 * @desc    Get user's unlocked badges
 * @access  Private
 */
router.get('/unlocked', badgesController.getUserBadges.bind(badgesController));

/**
 * @route   POST /api/badges/check
 * @desc    Check and unlock eligible badges for user
 * @access  Private
 */
router.post('/check', badgesController.checkAndUnlockBadges.bind(badgesController));

export default router;

