import express from 'express';
import { authenticate } from '../middleware/auth';
import { portfolioController } from '../controllers/portfolio.controller';
import { buyStockDebug } from '../controllers/portfolio.controller.debug';

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

// Trading - USING DEBUG VERSION WITH COMPREHENSIVE LOGGING
router.post('/buy', buyStockDebug);  // Using debug version
router.post('/sell', portfolioController.sellStock);

export default router;
