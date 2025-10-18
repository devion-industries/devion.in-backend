import express from 'express';
import { authenticate } from '../middleware/auth';
import quizController from '../controllers/quiz.controller';

const router = express.Router();

// All quiz routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/quizzes
 * @desc    Get all available quizzes
 * @access  Private
 */
router.get('/', quizController.getAllQuizzes);

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    Get quiz with questions
 * @access  Private
 */
router.get('/:quizId', quizController.getQuizQuestions);

/**
 * @route   POST /api/quizzes/submit
 * @desc    Submit quiz attempt
 * @access  Private
 */
router.post('/submit', quizController.submitQuiz);

/**
 * @route   GET /api/quizzes/attempts
 * @desc    Get user's quiz attempt history
 * @access  Private
 */
router.get('/user/attempts', quizController.getQuizAttempts);

export default router;

