import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    res.json({ message: 'Lessons endpoint - coming soon' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    res.json({ message: 'Lesson details endpoint - coming soon' });
  } catch (error) {
    next(error);
  }
});

export default router;

