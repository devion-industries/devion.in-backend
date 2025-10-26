import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface ReportPeriod {
  startDate: string;
  endDate: string;
  period: 'week' | 'month' | 'quarter';
}

class ReportsController {
  /**
   * Get weekly/monthly/quarterly report
   */
  async getReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { period = 'week', startDate, endDate } = req.query;

      // Calculate date range
      const dateRange = this.calculateDateRange(
        period as 'week' | 'month' | 'quarter',
        startDate as string | undefined,
        endDate as string | undefined
      );

      // Fetch all report data in parallel
      const [
        portfolioData,
        learningData,
        tradesData,
        badgesData,
        insightsData
      ] = await Promise.all([
        this.getPortfolioPerformance(userId, dateRange),
        this.getLearningProgress(userId, dateRange),
        this.getTradesData(userId, dateRange),
        this.getBadgesData(userId, dateRange),
        this.generateInsights(userId, dateRange)
      ]);

      res.json({
        success: true,
        report: {
          period: period,
          dateRange: {
            start: dateRange.startDate,
            end: dateRange.endDate,
          },
          portfolio: portfolioData,
          learning: learningData,
          trades: tradesData,
          badges: badgesData,
          insights: insightsData,
        }
      });
    } catch (error) {
      logger.error('Get report error:', error);
      next(error);
    }
  }

  /**
   * Get portfolio performance over time
   */
  async getPortfolioPerformance(userId: string, dateRange: ReportPeriod) {
    try {
      // Get portfolio value history from budget_change_history and calculate current value
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, budget_amount, current_cash, total_value, created_at')
        .eq('user_id', userId)
        .single();

      if (portfolioError) throw portfolioError;

      // Get holdings to calculate investment value
      const { data: holdings, error: holdingsError } = await supabase
        .from('holdings')
        .select('quantity, average_price, current_price, stock_symbol')
        .eq('portfolio_id', portfolio.id)
        .gt('quantity', 0);

      if (holdingsError) throw holdingsError;

      const investmentValue = holdings?.reduce((sum, h) => 
        sum + (h.quantity * (h.current_price || h.average_price)), 0
      ) || 0;

      // Get trades in period to calculate performance metrics
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('id, trade_type, quantity, price, total_amount, trade_date, stock_symbol')
        .eq('portfolio_id', portfolio.id)
        .gte('trade_date', dateRange.startDate)
        .lte('trade_date', dateRange.endDate)
        .order('trade_date', { ascending: true });

      if (tradesError) throw tradesError;

      // Calculate metrics
      const startValue = portfolio.budget_amount;
      const endValue = portfolio.total_value;
      const returnPercent = ((endValue - startValue) / startValue) * 100;
      
      // Find top performer from holdings
      let topPerformer = 'N/A';
      let topPerformerReturn = 0;
      if (holdings && holdings.length > 0) {
        holdings.forEach(holding => {
          const returnPct = ((holding.current_price - holding.average_price) / holding.average_price) * 100;
          if (returnPct > topPerformerReturn) {
            topPerformerReturn = returnPct;
            topPerformer = `${holding.stock_symbol} (${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%)`;
          }
        });
      }

      return {
        startValue: parseFloat(startValue.toString()),
        endValue: parseFloat(endValue.toString()),
        currentCash: parseFloat(portfolio.current_cash.toString()),
        investmentValue: parseFloat(investmentValue.toFixed(2)),
        return: parseFloat(returnPercent.toFixed(2)),
        trades: trades?.length || 0,
        topPerformer,
      };
    } catch (error) {
      logger.error('Get portfolio performance error:', error);
      throw error;
    }
  }

  /**
   * Get learning progress over time
   */
  async getLearningProgress(userId: string, dateRange: ReportPeriod) {
    try {
      // Get lessons completed in period
      const { data: lessons, error: lessonsError } = await supabase
        .from('user_progress')
        .select('lesson_id, completed, completed_at')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_at', dateRange.startDate)
        .lte('completed_at', dateRange.endDate);

      if (lessonsError) throw lessonsError;

      // Get quiz attempts in period
      const { data: quizAttempts, error: quizError } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, score, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', dateRange.startDate)
        .lte('completed_at', dateRange.endDate);

      if (quizError) throw quizError;

      // Calculate average quiz score
      const avgQuizScore = quizAttempts && quizAttempts.length > 0
        ? quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) / quizAttempts.length
        : 0;

      // Check if streak was maintained
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('login_streak, last_login')
        .eq('user_id', userId)
        .single();

      if (statsError) logger.error('Error fetching user stats:', statsError);

      const streakMaintained = userStats && userStats.login_streak > 0;

      return {
        lessonsCompleted: lessons?.length || 0,
        quizzesTaken: quizAttempts?.length || 0,
        avgQuizScore: Math.round(avgQuizScore),
        streakMaintained: !!streakMaintained,
        currentStreak: userStats?.login_streak || 0,
      };
    } catch (error) {
      logger.error('Get learning progress error:', error);
      throw error;
    }
  }

  /**
   * Get trades data for the period
   */
  async getTradesData(userId: string, dateRange: ReportPeriod) {
    try {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!portfolio) return [];

      const { data: trades, error } = await supabase
        .from('trades')
        .select('trade_type, quantity, price, stock_symbol, trade_date')
        .eq('portfolio_id', portfolio.id)
        .gte('trade_date', dateRange.startDate)
        .lte('trade_date', dateRange.endDate)
        .order('trade_date', { ascending: true });

      if (error) throw error;

      return trades || [];
    } catch (error) {
      logger.error('Get trades data error:', error);
      throw error;
    }
  }

  /**
   * Get badges earned in period
   */
  async getBadgesData(userId: string, dateRange: ReportPeriod) {
    try {
      const { data: badges, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          unlocked_at,
          badges (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('user_id', userId)
        .not('unlocked_at', 'is', null)
        .gte('unlocked_at', dateRange.startDate)
        .lte('unlocked_at', dateRange.endDate);

      if (error) throw error;

      return {
        newBadges: badges?.length || 0,
        badgesList: badges?.map(b => {
          const badgeData = Array.isArray(b.badges) ? b.badges[0] : b.badges;
          return {
            name: badgeData?.name || 'Unknown',
            description: badgeData?.description || '',
            icon: badgeData?.icon || '🏆',
            unlockedAt: b.unlocked_at || '',
          };
        }) || [],
      };
    } catch (error) {
      logger.error('Get badges data error:', error);
      throw error;
    }
  }

  /**
   * Generate AI insights based on user activity
   */
  async generateInsights(userId: string, dateRange: ReportPeriod) {
    try {
      const insights: string[] = [];

      // Get portfolio and learning data
      const [portfolioData, learningData] = await Promise.all([
        this.getPortfolioPerformance(userId, dateRange),
        this.getLearningProgress(userId, dateRange),
      ]);

      // Portfolio insights
      if (portfolioData.return > 0) {
        insights.push(
          `Great work! Your portfolio grew by ${portfolioData.return.toFixed(2)}% this period, earning you ₹${(portfolioData.endValue - portfolioData.startValue).toFixed(2)}. Keep up the momentum!`
        );
      } else if (portfolioData.return < 0) {
        insights.push(
          `Your portfolio faced a ${Math.abs(portfolioData.return).toFixed(2)}% decline this period. Remember, volatility is normal in markets. Use this as a learning opportunity to review your strategy.`
        );
      }

      // Top performer insight
      if (portfolioData.topPerformer !== 'N/A') {
        insights.push(
          `Your top performer was ${portfolioData.topPerformer}. Consider researching what drove this stock's performance to refine your investment strategy.`
        );
      }

      // Learning insights
      if (learningData.lessonsCompleted > 0) {
        insights.push(
          `You completed ${learningData.lessonsCompleted} lesson${learningData.lessonsCompleted > 1 ? 's' : ''} this period. Continuous learning is key to becoming a better investor!`
        );
      }

      if (learningData.avgQuizScore >= 80) {
        insights.push(
          `Excellent quiz performance with an average score of ${learningData.avgQuizScore}%! Your understanding of financial concepts is strong.`
        );
      } else if (learningData.avgQuizScore > 0 && learningData.avgQuizScore < 70) {
        insights.push(
          `Your average quiz score is ${learningData.avgQuizScore}%. Consider revisiting lessons and using the AI Tutor to strengthen your understanding.`
        );
      }

      // Streak insight
      if (learningData.streakMaintained && learningData.currentStreak >= 7) {
        insights.push(
          `🔥 Amazing ${learningData.currentStreak}-day learning streak! Consistency is your superpower - successful investors build habits, not just portfolios.`
        );
      }

      // Trading activity insight
      if (portfolioData.trades === 0) {
        insights.push(
          `No trades this period. Remember, the Market page has ${portfolioData.currentCash > 0 ? `₹${portfolioData.currentCash.toLocaleString()} cash available` : 'funds available'} for you to explore investment opportunities!`
        );
      } else if (portfolioData.trades > 5) {
        insights.push(
          `You made ${portfolioData.trades} trades this period. Active trading can be educational, but remember: quality often beats quantity. Focus on well-researched decisions.`
        );
      }

      // Default insight if no specific insights
      if (insights.length === 0) {
        insights.push(
          `Keep exploring the platform! Try completing more lessons, taking quizzes, and practicing trades to build your financial knowledge.`
        );
      }

      return insights;
    } catch (error) {
      logger.error('Generate insights error:', error);
      // Return generic insights on error
      return [
        'Your portfolio is ready for your next investments!',
        'Continue learning to make more informed trading decisions.',
        'Check out the Market page to explore new investment opportunities.',
      ];
    }
  }

  /**
   * Calculate date range based on period
   */
  private calculateDateRange(
    period: 'week' | 'month' | 'quarter',
    startDate?: string,
    endDate?: string
  ): ReportPeriod {
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    let start: Date;

    if (startDate) {
      start = new Date(startDate);
    } else {
      switch (period) {
        case 'week':
          start = new Date(end);
          start.setDate(start.getDate() - 7);
          break;
        case 'month':
          start = new Date(end);
          start.setMonth(start.getMonth() - 1);
          break;
        case 'quarter':
          start = new Date(end);
          start.setMonth(start.getMonth() - 3);
          break;
        default:
          start = new Date(end);
          start.setDate(start.getDate() - 7);
      }
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      period,
    };
  }

  /**
   * Get available report periods
   */
  async getAvailablePeriods(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get user's account creation date
      const { data: user, error } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const accountCreated = new Date(user.created_at);
      const now = new Date();
      const periods: any[] = [];

      // Generate weekly periods since account creation
      let currentDate = new Date(now);
      let weekCount = 0;
      
      while (currentDate > accountCreated && weekCount < 12) {
        const endDate = new Date(currentDate);
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 7);

        if (startDate >= accountCreated) {
          periods.push({
            type: 'week',
            label: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          });
        }

        currentDate.setDate(currentDate.getDate() - 7);
        weekCount++;
      }

      res.json({
        success: true,
        periods,
        accountCreated: user.created_at,
      });
    } catch (error) {
      logger.error('Get available periods error:', error);
      next(error);
    }
  }

  /**
   * Get performance chart data
   */
  async getPerformanceChart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { period = 'week' } = req.query;

      const dateRange = this.calculateDateRange(period as any);

      // Get portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id, budget_amount')
        .eq('user_id', userId)
        .single();

      if (!portfolio) {
        return res.json({ success: true, chartData: [] });
      }

      // Get trades in period
      const { data: trades } = await supabase
        .from('trades')
        .select('trade_type, total_amount, trade_date')
        .eq('portfolio_id', portfolio.id)
        .gte('trade_date', dateRange.startDate)
        .lte('trade_date', dateRange.endDate)
        .order('trade_date', { ascending: true });

      // Generate chart data points
      const chartData = this.generateChartData(
        period as any,
        portfolio.budget_amount,
        trades || [],
        dateRange
      );

      res.json({
        success: true,
        chartData,
      });
    } catch (error) {
      logger.error('Get performance chart error:', error);
      next(error);
    }
  }

  /**
   * Generate chart data based on trades
   */
  private generateChartData(
    period: 'week' | 'month' | 'quarter',
    startingValue: number,
    trades: any[],
    dateRange: ReportPeriod
  ) {
    const chartData: any[] = [];
    const dataPoints = period === 'week' ? 7 : period === 'month' ? 4 : 3;
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const intervalMs = (endDate.getTime() - startDate.getTime()) / dataPoints;

    for (let i = 0; i <= dataPoints; i++) {
      const pointDate = new Date(startDate.getTime() + (intervalMs * i));
      
      // Calculate value at this point based on trades up to this date
      const tradesUpToNow = trades.filter(t => new Date(t.trade_date) <= pointDate);
      
      // Simple approximation - in reality you'd calculate actual portfolio value
      const value = startingValue; // Placeholder
      const nifty = startingValue * (1 + (Math.random() * 0.04 - 0.02)); // Mock NIFTY data
      
      chartData.push({
        date: period === 'week' 
          ? pointDate.toLocaleDateString('en-US', { weekday: 'short' })
          : `${pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        value: Math.round(value),
        nifty: Math.round(nifty),
      });
    }

    return chartData;
  }
}

export default new ReportsController();

