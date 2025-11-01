import express from 'express';
import { authenticate } from '../middleware/auth';
import { portfolioController } from '../controllers/portfolio.controller';
import { tradingRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Portfolio management
router.get('/', portfolioController.getPortfolio.bind(portfolioController));
router.get('/holdings', portfolioController.getHoldings.bind(portfolioController));
router.get('/trades', portfolioController.getTradeHistory.bind(portfolioController));
router.get('/performance', portfolioController.getPerformance.bind(portfolioController));

// Budget management
router.put('/budget', portfolioController.updateBudget.bind(portfolioController));
router.get('/budget/history', portfolioController.getBudgetHistory.bind(portfolioController));

// Trading with rate limiting to prevent spam
router.post('/buy', tradingRateLimiter, portfolioController.buyStock.bind(portfolioController));
router.post('/sell', tradingRateLimiter, portfolioController.sellStock.bind(portfolioController));

export default router;
