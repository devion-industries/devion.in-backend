import express from 'express';
import { authenticate } from '../middleware/auth';
import { lessonsController } from '../controllers/lessons.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/lessons/modules
 * @desc    Get all modules with user progress
 * @access  Private
 */
router.get('/modules', lessonsController.getModules);

/**
 * @route   GET /api/lessons/modules/:moduleId
 * @desc    Get all lessons in a module with user progress
 * @access  Private
 */
router.get('/modules/:moduleId', lessonsController.getLessonsByModule);

/**
 * @route   GET /api/lessons/progress/overall
 * @desc    Get user's overall learning progress
 * @access  Private
 */
router.get('/progress/overall', lessonsController.getOverallProgress);

/**
 * @route   GET /api/lessons/search
 * @desc    Search lessons by query, tag, or difficulty
 * @access  Private
 */
router.get('/search', lessonsController.searchLessons);

/**
 * @route   GET /api/lessons/:lessonId
 * @desc    Get specific lesson with cards, quiz, and progress
 * @access  Private
 */
router.get('/:lessonId', lessonsController.getLesson);

/**
 * @route   POST /api/lessons/:lessonId/start
 * @desc    Start a lesson (create initial progress)
 * @access  Private
 */
router.post('/:lessonId/start', lessonsController.startLesson);

/**
 * @route   PUT /api/lessons/:lessonId/progress
 * @desc    Update lesson progress (card navigation)
 * @access  Private
 */
router.put('/:lessonId/progress', lessonsController.updateLessonProgress);

/**
 * @route   POST /api/lessons/:lessonId/complete
 * @desc    Mark lesson as completed
 * @access  Private
 */
router.post('/:lessonId/complete', lessonsController.completeLesson);

/**
 * @route   POST /api/lessons/:lessonId/quiz
 * @desc    Submit quiz answers and get score
 * @access  Private
 */
router.post('/:lessonId/quiz', lessonsController.submitQuiz);

export default router;
