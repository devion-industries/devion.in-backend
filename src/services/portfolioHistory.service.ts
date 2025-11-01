import { supabase } from '../config/database';
import logger from '../utils/logger';

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  portfolio_id: string;
  snapshot_date: string;
  snapshot_time: string;
  total_value: number;
  holdings_value: number;
  cash_value: number;
  total_invested: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  holdings_count: number;
  created_at: string;
}

export interface PortfolioHistoryData {
  date: string;
  value: number;
  gain_loss: number;
  gain_loss_percent: number;
}

export class PortfolioHistoryService {
  /**
   * Take a snapshot of user's current portfolio
   */
  static async takeSnapshot(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('take_portfolio_snapshot', {
        p_user_id: userId
      });

      if (error) {
        logger.error('Error taking portfolio snapshot:', error);
        throw new Error(`Failed to take snapshot: ${error.message}`);
      }

      logger.info(`Portfolio snapshot taken for user ${userId}`);
    } catch (error: any) {
      logger.error('Error in takeSnapshot:', error);
      throw error;
    }
  }

  /**
   * Get portfolio history for a specific time period
   */
  static async getHistory(
    userId: string,
    period: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
  ): Promise<PortfolioHistoryData[]> {
    try {
      // Calculate date range based on period
      const startDate = this.calculateStartDate(period);

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('snapshot_date', startDate)
        .order('snapshot_date', { ascending: true });

      if (error) {
        logger.error('Error fetching portfolio history:', error);
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform data to chart format
      const historyData: PortfolioHistoryData[] = data.map((snapshot: any) => ({
        date: snapshot.snapshot_date,
        value: parseFloat(snapshot.total_value),
        gain_loss: parseFloat(snapshot.total_gain_loss),
        gain_loss_percent: parseFloat(snapshot.total_gain_loss_percent)
      }));

      return historyData;
    } catch (error: any) {
      logger.error('Error in getHistory:', error);
      throw error;
    }
  }

  /**
   * Get the most recent snapshot for a user
   */
  static async getLatestSnapshot(userId: string): Promise<PortfolioSnapshot | null> {
    try {
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No snapshots found
          return null;
        }
        logger.error('Error fetching latest snapshot:', error);
        throw new Error(`Failed to fetch snapshot: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      logger.error('Error in getLatestSnapshot:', error);
      throw error;
    }
  }

  /**
   * Take snapshots for all users with portfolios (for cron job)
   */
  static async takeAllSnapshots(): Promise<{ success: number; failed: number }> {
    try {
      // Get all users who have portfolios
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select('user_id')
        .gt('total_value', 0); // Only snapshot users with actual portfolio value

      if (error) {
        logger.error('Error fetching portfolios for snapshots:', error);
        throw new Error(`Failed to fetch portfolios: ${error.message}`);
      }

      if (!portfolios || portfolios.length === 0) {
        logger.info('No portfolios to snapshot');
        return { success: 0, failed: 0 };
      }

      let successCount = 0;
      let failedCount = 0;

      // Take snapshot for each user
      for (const portfolio of portfolios) {
        try {
          await this.takeSnapshot(portfolio.user_id);
          successCount++;
        } catch (error) {
          logger.error(`Failed to take snapshot for user ${portfolio.user_id}:`, error);
          failedCount++;
        }
      }

      logger.info(`Snapshots complete: ${successCount} success, ${failedCount} failed`);
      return { success: successCount, failed: failedCount };
    } catch (error: any) {
      logger.error('Error in takeAllSnapshots:', error);
      throw error;
    }
  }

  /**
   * Calculate start date based on period
   */
  private static calculateStartDate(period: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'): string {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '1D':
        // Last 24 hours (but we only have daily snapshots, so yesterday)
        startDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        // Get all data (set to a very old date)
        startDate = new Date('2020-01-01');
        break;
    }

    return startDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Create initial snapshot when user first has holdings
   * This ensures we have a starting point for the chart
   */
  static async createInitialSnapshot(userId: string): Promise<void> {
    try {
      // Check if user already has snapshots
      const existing = await this.getLatestSnapshot(userId);
      
      if (!existing) {
        // No snapshots yet, create the first one
        await this.takeSnapshot(userId);
        logger.info(`Initial snapshot created for user ${userId}`);
      }
    } catch (error: any) {
      logger.error('Error in createInitialSnapshot:', error);
      // Don't throw - this is a non-critical operation
    }
  }
}

