import express from 'express';
import { authenticate } from '../middleware/auth';
import reportsController from '../controllers/reports.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get report for a specific period
router.get('/', reportsController.getReport.bind(reportsController));

// Get available report periods
router.get('/periods', reportsController.getAvailablePeriods.bind(reportsController));

// Get performance chart data
router.get('/chart', reportsController.getPerformanceChart.bind(reportsController));

export default router;

