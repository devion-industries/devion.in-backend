import express from 'express';
import { authenticate } from '../middleware/auth';
import { aiController } from '../controllers/ai.controller';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/ai/ask
 * @desc    Ask the AI tutor a question
 * @access  Private
 * @body    { question: string }
 */
router.post('/ask', aiController.askQuestion);

/**
 * @route   GET /api/ai/portfolio-insights
 * @desc    Get AI-generated portfolio insights
 * @access  Private
 */
router.get('/portfolio-insights', aiController.getPortfolioInsights);

/**
 * @route   POST /api/ai/explain
 * @desc    Get explanation for a financial concept
 * @access  Private
 * @body    { concept: string }
 */
router.post('/explain', aiController.explainConcept);

/**
 * @route   GET /api/ai/learning-path
 * @desc    Get personalized learning path suggestions
 * @access  Private
 */
router.get('/learning-path', aiController.getLearningPath);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Private
 */
router.get('/health', aiController.healthCheck);

export default router;

