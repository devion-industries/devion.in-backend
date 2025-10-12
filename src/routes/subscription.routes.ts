import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/plans', async (req, res, next) => {
  try {
    res.json({ message: 'Subscription plans endpoint - coming soon' });
  } catch (error) {
    next(error);
  }
});

router.get('/current', authenticate, async (req, res, next) => {
  try {
    res.json({ message: 'Current subscription endpoint - coming soon' });
  } catch (error) {
    next(error);
  }
});

export default router;

