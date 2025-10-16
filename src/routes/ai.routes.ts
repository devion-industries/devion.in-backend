import express from 'express';
import { authenticate } from '../middleware/auth';
import { aiController } from '../controllers/ai.controller';
import { aiRateLimiter, insightsRateLimiter } from '../middleware/rateLimit';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/ai/ask
 * @desc    Ask the AI tutor a question
 * @access  Private
 * @body    { question: string }
 * @rateLimit 10 requests per hour
 */
router.post('/ask', aiRateLimiter, aiController.askQuestion);

/**
 * @route   GET /api/ai/portfolio-insights
 * @desc    Get AI-generated portfolio insights
 * @access  Private
 * @rateLimit 20 requests per hour
 */
router.get('/portfolio-insights', insightsRateLimiter, aiController.getPortfolioInsights);

/**
 * @route   POST /api/ai/explain
 * @desc    Get explanation for a financial concept
 * @access  Private
 * @body    { concept: string }
 * @rateLimit 10 requests per hour
 */
router.post('/explain', aiRateLimiter, aiController.explainConcept);

/**
 * @route   GET /api/ai/learning-path
 * @desc    Get personalized learning path suggestions
 * @access  Private
 * @rateLimit 20 requests per hour
 */
router.get('/learning-path', insightsRateLimiter, aiController.getLearningPath);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Private
 */
router.get('/health', aiController.healthCheck);

export default router;

