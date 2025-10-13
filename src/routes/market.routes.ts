import express from 'express';
import { authenticate } from '../middleware/auth';
import { marketController } from '../controllers/market.controller';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/top', marketController.getTopStocks); // Get top 20 stocks with prices
router.get('/stocks', marketController.getAllStocks);
router.get('/featured', marketController.getFeaturedStocks); // Alias for easier access
router.get('/stocks/featured', marketController.getFeaturedStocks);
router.get('/search', marketController.searchStocks); // Search all 2000 stocks
router.get('/stocks/search', marketController.searchStocks);
router.get('/stocks/:symbol', marketController.getStockDetails);
router.get('/stocks/:symbol/historical', marketController.getHistoricalData);
router.get('/sectors', marketController.getSectors);

// Admin endpoints (would need admin middleware)
router.post('/sync', authenticate, marketController.syncStockData);

export default router;

