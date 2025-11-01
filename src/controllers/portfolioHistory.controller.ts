import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PortfolioHistoryService } from '../services/portfolioHistory.service';
import logger from '../utils/logger';

export class PortfolioHistoryController {
  /**
   * GET /api/portfolio/history
   * Get portfolio historical data
   */
  static async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }

      const period = (req.query.period as string || 'ALL').toUpperCase() as '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

      // Validate period
      if (!['1D', '1W', '1M', '3M', '1Y', 'ALL'].includes(period)) {
        res.status(400).json({ 
          error: { 
            message: 'Invalid period. Must be one of: 1D, 1W, 1M, 3M, 1Y, ALL' 
          } 
        });
        return;
      }

      const historyData = await PortfolioHistoryService.getHistory(userId, period);

      res.status(200).json({
        period,
        data: historyData,
        count: historyData.length
      });
    } catch (error: any) {
      logger.error('Error in getHistory:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to fetch portfolio history',
          details: error.message 
        } 
      });
    }
  }

  /**
   * POST /api/portfolio/snapshot
   * Manually trigger a snapshot (for testing or after trades)
   */
  static async takeSnapshot(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }

      await PortfolioHistoryService.takeSnapshot(userId);

      res.status(200).json({
        message: 'Portfolio snapshot taken successfully'
      });
    } catch (error: any) {
      logger.error('Error in takeSnapshot:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to take portfolio snapshot',
          details: error.message 
        } 
      });
    }
  }

  /**
   * GET /api/portfolio/snapshot/latest
   * Get the most recent snapshot
   */
  static async getLatestSnapshot(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }

      const snapshot = await PortfolioHistoryService.getLatestSnapshot(userId);

      if (!snapshot) {
        res.status(404).json({ 
          error: { 
            message: 'No snapshots found. Start trading to build your history!' 
          } 
        });
        return;
      }

      res.status(200).json({ snapshot });
    } catch (error: any) {
      logger.error('Error in getLatestSnapshot:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to fetch latest snapshot',
          details: error.message 
        } 
      });
    }
  }

  /**
   * POST /api/portfolio/snapshots/all (Admin only)
   * Trigger snapshots for all users
   */
  static async takeAllSnapshots(req: Request, res: Response): Promise<void> {
    try {
      // Check if request has admin authorization
      const adminKey = req.get('x-admin-key');
      
      if (adminKey !== process.env.ADMIN_API_KEY) {
        res.status(403).json({ error: { message: 'Forbidden' } });
        return;
      }

      const result = await PortfolioHistoryService.takeAllSnapshots();

      res.status(200).json({
        message: 'Snapshots completed',
        success: result.success,
        failed: result.failed,
        total: result.success + result.failed
      });
    } catch (error: any) {
      logger.error('Error in takeAllSnapshots:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to take snapshots',
          details: error.message 
        } 
      });
    }
  }
}

