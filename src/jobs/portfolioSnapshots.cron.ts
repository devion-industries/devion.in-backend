import cron from 'node-cron';
import { PortfolioHistoryService } from '../services/portfolioHistory.service';
import logger from '../utils/logger';

/**
 * Cron job to take daily portfolio snapshots
 * Runs every day at 3:35 PM IST (market closes at 3:30 PM IST)
 * 
 * Cron expression: '35 15 * * 1-5'
 * - Minute: 35
 * - Hour: 15 (3 PM in 24-hour format, adjusted for server timezone)
 * - Day of month: * (every day)
 * - Month: * (every month)
 * - Day of week: 1-5 (Monday to Friday only, skip weekends)
 * 
 * Note: Adjust timezone if server is not in IST
 */
export function startPortfolioSnapshotCron() {
  // Run at 3:35 PM IST on weekdays (after market closes at 3:30 PM)
  const cronExpression = '35 15 * * 1-5'; // Mon-Fri at 3:35 PM IST
  
  const job = cron.schedule(cronExpression, async () => {
    try {
      logger.info('📸 Starting daily portfolio snapshots...');
      
      const startTime = Date.now();
      const result = await PortfolioHistoryService.takeAllSnapshots();
      const duration = Date.now() - startTime;
      
      logger.info(`✅ Daily snapshots complete in ${duration}ms: ${result.success} success, ${result.failed} failed`);
      
      // Alert if there were failures
      if (result.failed > 0) {
        logger.warn(`⚠️  ${result.failed} snapshots failed`);
      }
    } catch (error) {
      logger.error('❌ Daily snapshot cron job failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // IST timezone
  });
  
  logger.info('✅ Portfolio snapshot cron job started (3:35 PM IST, Mon-Fri)');
  
  return job;
}

/**
 * Manual trigger for testing (can be called from API endpoint)
 */
export async function triggerSnapshotManually() {
  try {
    logger.info('📸 Manual snapshot trigger initiated...');
    
    const result = await PortfolioHistoryService.takeAllSnapshots();
    
    logger.info(`✅ Manual snapshots complete: ${result.success} success, ${result.failed} failed`);
    
    return result;
  } catch (error) {
    logger.error('❌ Manual snapshot trigger failed:', error);
    throw error;
  }
}

