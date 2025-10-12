import express from 'express';
import { authenticate } from '../middleware/auth';
import { portfolioController } from '../controllers/portfolio.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Portfolio management
router.get('/', portfolioController.getPortfolio);
router.get('/holdings', portfolioController.getHoldings);
router.get('/trades', portfolioController.getTradeHistory);
router.get('/performance', portfolioController.getPerformance);

// Budget management
router.put('/budget', portfolioController.updateBudget);
router.get('/budget/history', portfolioController.getBudgetHistory);

// Trading
router.post('/buy', portfolioController.buyStock);
router.post('/sell', portfolioController.sellStock);

export default router;
