import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    res.json({ message: 'Badges endpoint - coming soon' });
  } catch (error) {
    next(error);
  }
});

export default router;

