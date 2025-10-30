// Sentry must be imported and initialized first
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { setupExpressErrorHandler, expressIntegration } from '@sentry/node';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateEnv } from './config/env';
import logger from './utils/logger';
import { redisService } from './services/redis.service';

// Initialize Sentry for error tracking and performance monitoring
Sentry.init({
  dsn: "https://4a6ad47652796f193d5197506705aa31@o4510279217250304.ingest.de.sentry.io/4510279229112400",
  integrations: [
    nodeProfilingIntegration(),
    expressIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions
  // Profiling
  profilesSampleRate: 0.1, // Capture 10% of profiles
  environment: config.nodeEnv,
});

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
// import cohortRoutes from './routes/cohort.routes'; // ❌ DEPRECATED: Teacher cohorts removed
import leaderboardRoutes from './routes/leaderboard.routes';
import friendGroupsRoutes from './routes/friendGroups.routes'; // ✅ NEW: Friend groups system
import reportsRoutes from './routes/reports.routes';

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
app.use('/api/quizzes', quizRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/subscription', subscriptionRoutes);
// app.use('/api/cohorts', cohortRoutes); // ❌ DEPRECATED: Teacher cohorts removed
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/friend-groups', friendGroupsRoutes); // ✅ NEW: Friend groups system
app.use('/api/reports', reportsRoutes);
app.use('/api/user', require('./routes/user.routes').default);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Sentry error handler MUST be before custom error handlers
setupExpressErrorHandler(app);

// Custom error handler (must be last)
app.use(errorHandler);

// Initialize Redis connection
redisService.connect().catch((error) => {
  logger.error('Failed to connect to Redis:', error);
  logger.warn('⚠️  Application will continue without Redis caching');
});

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
  Sentry.captureException(reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await redisService.disconnect();
  await Sentry.close(2000); // Wait up to 2 seconds to flush events
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await redisService.disconnect();
  await Sentry.close(2000); // Wait up to 2 seconds to flush events
  process.exit(0);
});

export default app;

