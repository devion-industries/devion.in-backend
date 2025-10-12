import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateEnv } from './config/env';
import logger from './utils/logger';

// Middleware imports
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import marketRoutes from './routes/market.routes';
import portfolioRoutes from './routes/portfolio.routes';
import lessonsRoutes from './routes/lessons.routes';
import quizRoutes from './routes/quiz.routes';
import aiRoutes from './routes/ai.routes';
import voiceRoutes from './routes/voice.routes';
import badgesRoutes from './routes/badges.routes';
import subscriptionRoutes from './routes/subscription.routes';

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Create Express app
const app = express();

// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/subscription', subscriptionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Devion Backend Server started on port ${PORT}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🔒 CORS enabled for: ${config.cors.origin.join(', ')}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;

