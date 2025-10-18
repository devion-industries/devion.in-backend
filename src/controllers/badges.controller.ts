import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class BadgesController {
  /**
   * Get all badges with user progress
   * GET /api/badges
   */
  getAllBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get all badges
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('category', { ascending: true });

      if (badgesError) {
        throw createError('Failed to fetch badges', 500);
      }

      // Get user's unlocked badges
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (userBadgesError) {
        logger.error('Error fetching user badges:', userBadgesError);
      }

      // Get user stats for progress calculation
      const stats = await this.getUserStats(userId);

      // Combine badges with user progress
      const badgesWithProgress = badges.map((badge) => {
        const userBadge = userBadges?.find((ub) => ub.badge_id === badge.id);
        const progress = this.calculateBadgeProgress(badge.criteria, stats);

        return {
          ...badge,
          unlocked: !!userBadge,
          unlocked_at: userBadge?.unlocked_at || null,
          progress: progress.current,
          progress_target: progress.target,
          progress_percent: progress.target > 0 ? Math.round((progress.current / progress.target) * 100) : 0,
        };
      });

      res.json({
        badges: badgesWithProgress,
        total_unlocked: userBadges?.length || 0,
        total_badges: badges.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's unlocked badges
   * GET /api/badges/unlocked
   */
  getUserBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const { data: userBadges, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        throw createError('Failed to fetch user badges', 500);
      }

      res.json({
        badges: userBadges || [],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check and unlock badges for user
   * POST /api/badges/check
   */
  checkAndUnlockBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get all badges
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError) {
        throw createError('Failed to fetch badges', 500);
      }

      // Get already unlocked badges
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      if (userBadgesError) {
        throw createError('Failed to fetch user badges', 500);
      }

      const unlockedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

      // Get user stats
      const stats = await this.getUserStats(userId);

      // Check which badges should be unlocked
      const newlyUnlocked: any[] = [];

      for (const badge of badges) {
        if (!unlockedBadgeIds.has(badge.id)) {
          if (this.checkBadgeCriteria(badge.criteria, stats)) {
            // Unlock badge
            const { error: unlockError } = await supabase
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: badge.id,
                progress_current: this.calculateBadgeProgress(badge.criteria, stats).current,
                progress_target: this.calculateBadgeProgress(badge.criteria, stats).target,
              });

            if (!unlockError) {
              newlyUnlocked.push(badge);
              logger.info(`Badge unlocked for user ${userId}: ${badge.name}`);
            }
          }
        }
      }

      res.json({
        newly_unlocked: newlyUnlocked,
        count: newlyUnlocked.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics for badge progress calculation
   */
  private getUserStats = async (userId: string): Promise<any> => {
    try {
      // Get trade count
      const { count: tradeCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get portfolio data
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get holdings for sector diversity
      const { data: holdings } = await supabase
        .from('holdings')
        .select(`
          *,
          stocks (sector)
        `)
        .eq('portfolio_id', portfolio?.id || '');

      const uniqueSectors = new Set(
        holdings?.map((h: any) => h.stocks?.sector).filter(Boolean) || []
      );

      // Get lessons completed
      const { count: lessonsCompleted } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Get modules completed
      const { data: moduleProgress } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', userId);

      const modulesCompleted = moduleProgress?.filter(
        m => m.progress_percentage === 100
      ).length || 0;

      // Get quiz attempts
      const { count: quizzesCompleted } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get perfect quiz scores
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId);

      const perfectScores = quizAttempts?.filter(
        qa => (qa.score / qa.total_questions) * 100 === 100
      ).length || 0;

      const highScores = quizAttempts?.filter(
        qa => (qa.score / qa.total_questions) * 100 >= 90
      ).length || 0;

      // Get user creation date
      const { data: user } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      const joinYear = user?.created_at ? new Date(user.created_at).getFullYear() : 0;

      // Calculate total profit
      const totalProfit = (portfolio?.total_value || 0) - (portfolio?.budget_amount || 0);
      const returnPercent = portfolio?.budget_amount
        ? ((totalProfit / portfolio.budget_amount) * 100)
        : 0;

      // Get winning trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('executed_at', { ascending: true });

      let winningTrades = 0;
      if (trades && trades.length > 0) {
        // Group trades by symbol to calculate P&L
        const tradesBySymbol: any = {};
        trades.forEach((trade: any) => {
          if (!tradesBySymbol[trade.symbol]) {
            tradesBySymbol[trade.symbol] = [];
          }
          tradesBySymbol[trade.symbol].push(trade);
        });

        // Calculate winning trades (simplified - sells that were higher than avg buy)
        Object.values(tradesBySymbol).forEach((symbolTrades: any) => {
          symbolTrades.forEach((trade: any) => {
            if (trade.type === 'SELL') {
              winningTrades++; // Simplified: assume sells are wins
            }
          });
        });
      }

      const winRate = tradeCount ? (winningTrades / tradeCount) * 100 : 0;

      return {
        trade_count: tradeCount || 0,
        portfolio_value: portfolio?.total_value || 0,
        sector_diversity: uniqueSectors.size,
        lessons_completed: lessonsCompleted || 0,
        modules_completed: modulesCompleted,
        quizzes_completed: quizzesCompleted || 0,
        perfect_quiz_scores: perfectScores,
        high_quiz_scores: highScores,
        join_year: joinYear,
        total_profit: totalProfit,
        return_percent: returnPercent,
        win_rate: winRate,
        holdings_count: holdings?.length || 0,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      return {};
    }
  }

  /**
   * Check if badge criteria is met
   */
  private checkBadgeCriteria = (criteria: any, stats: any): boolean => {
    try {
      switch (criteria.type) {
        case 'trade_count':
          return stats.trade_count >= criteria.value;

        case 'portfolio_value':
          return stats.portfolio_value >= criteria.value;

        case 'lessons_completed':
          return stats.lessons_completed >= criteria.value;

        case 'modules_completed':
          return stats.modules_completed >= criteria.value;

        case 'quizzes_completed':
          return stats.quizzes_completed >= criteria.value;

        case 'perfect_quiz_score':
          return stats.perfect_quiz_scores >= 1;

        case 'perfect_quiz_scores':
          return stats.perfect_quiz_scores >= criteria.value;

        case 'high_quiz_scores':
          return stats.high_quiz_scores >= criteria.count;

        case 'all_quizzes_passed':
          return stats.quizzes_completed >= criteria.value;

        case 'sector_diversity':
          return stats.sector_diversity >= criteria.value;

        case 'total_profit':
          return stats.total_profit >= criteria.value;

        case 'portfolio_return_percent':
          return stats.return_percent >= criteria.value;

        case 'win_rate':
          return stats.win_rate >= criteria.value && stats.trade_count >= criteria.min_trades;

        case 'join_year':
          return stats.join_year === criteria.value;

        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking badge criteria:', error);
      return false;
    }
  }

  /**
   * Calculate badge progress
   */
  private calculateBadgeProgress = (criteria: any, stats: any): { current: number; target: number } => {
    try {
      switch (criteria.type) {
        case 'trade_count':
          return { current: stats.trade_count, target: criteria.value };

        case 'portfolio_value':
          return { current: stats.portfolio_value, target: criteria.value };

        case 'lessons_completed':
          return { current: stats.lessons_completed, target: criteria.value };

        case 'modules_completed':
          return { current: stats.modules_completed, target: criteria.value };

        case 'quizzes_completed':
          return { current: stats.quizzes_completed, target: criteria.value };

        case 'perfect_quiz_score':
        case 'perfect_quiz_scores':
          return { current: stats.perfect_quiz_scores, target: criteria.value || 1 };

        case 'high_quiz_scores':
          return { current: stats.high_quiz_scores, target: criteria.count };

        case 'all_quizzes_passed':
          return { current: stats.quizzes_completed, target: criteria.value };

        case 'sector_diversity':
          return { current: stats.sector_diversity, target: criteria.value };

        case 'total_profit':
          return { current: stats.total_profit, target: criteria.value };

        case 'portfolio_return_percent':
          return { current: Math.round(stats.return_percent), target: criteria.value };

        case 'win_rate':
          return { current: Math.round(stats.win_rate), target: criteria.value };

        default:
          return { current: 0, target: 1 };
      }
    } catch (error) {
      logger.error('Error calculating badge progress:', error);
      return { current: 0, target: 1 };
    }
  }
}

export default new BadgesController();

