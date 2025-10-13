import express from 'express';
import { authenticate } from '../middleware/auth';
import { voiceController } from '../controllers/voice.controller';

const router = express.Router();

// All voice routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/voice/ask
 * @desc    Ask a question and get voice response
 * @access  Private
 * @body    { question: string, voiceType?: string }
 */
router.post('/ask', voiceController.askQuestion);

/**
 * @route   POST /api/voice/explain
 * @desc    Get voice explanation for a financial concept
 * @access  Private
 * @body    { concept: string, voiceType?: string }
 */
router.post('/explain', voiceController.explainConcept);

/**
 * @route   GET /api/voice/portfolio-insights
 * @desc    Get voice narration of portfolio insights
 * @access  Private
 * @query   voiceType?: string
 */
router.get('/portfolio-insights', voiceController.narratePortfolioInsights);

/**
 * @route   POST /api/voice/tts
 * @desc    Convert text to speech (generic TTS)
 * @access  Private
 * @body    { text: string, voiceType?: string }
 */
router.post('/tts', voiceController.textToSpeech);

/**
 * @route   POST /api/voice/session/start
 * @desc    Start a new voice session
 * @access  Private
 */
router.post('/session/start', voiceController.startSession);

/**
 * @route   POST /api/voice/session/end
 * @desc    End current voice session
 * @access  Private
 * @body    { sessionId: string }
 */
router.post('/session/end', voiceController.endSession);

/**
 * @route   GET /api/voice/voices
 * @desc    Get available voice options
 * @access  Private
 */
router.get('/voices', voiceController.getVoices);

/**
 * @route   GET /api/voice/usage
 * @desc    Get user's voice usage statistics
 * @access  Private
 */
router.get('/usage', voiceController.getUsageStats);

/**
 * @route   GET /api/voice/health
 * @desc    Check voice service health
 * @access  Private
 */
router.get('/health', voiceController.healthCheck);

export default router;

