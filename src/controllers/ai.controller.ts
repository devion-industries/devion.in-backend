import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class AIController {
  /**
   * Ask the AI tutor a question
   * POST /api/ai/ask
   */
  async askQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { question } = req.body;

      if (!question || question.trim().length === 0) {
        throw createError('Question is required', 400);
      }

      if (question.length > 500) {
        throw createError('Question is too long. Please keep it under 500 characters.', 400);
      }

      // Get user's portfolio context for more personalized responses
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();

      let context = undefined;

      if (portfolio) {
        // Get detailed holdings with stock info
        const { data: holdings } = await supabase
          .from('holdings')
          .select('*, stocks(company_name, sector, current_price)')
          .eq('portfolio_id', portfolio.id)
          .gt('quantity', 0);

        // Get recent trades (last 5)
        const { data: recentTrades } = await supabase
          .from('trades')
          .select('symbol, type, quantity, price, executed_at')
          .eq('user_id', userId)
          .order('executed_at', { ascending: false })
          .limit(5);

        // Build rich context
        context = {
          userId,
          budget: portfolio.budget_amount,
          portfolioValue: portfolio.total_value,
          cashAvailable: portfolio.current_cash,
          totalInvested: holdings?.reduce((sum: number, h: any) => sum + (h.avg_buy_price * h.quantity), 0) || 0,
          holdings: holdings?.map((h: any) => ({
            symbol: h.symbol,
            companyName: h.stocks?.company_name || h.symbol,
            sector: h.stocks?.sector || 'Other',
            quantity: h.quantity,
            avgCost: h.avg_buy_price,
            currentPrice: h.stocks?.current_price || h.avg_buy_price,
            invested: h.avg_buy_price * h.quantity,
            currentValue: (h.stocks?.current_price || h.avg_buy_price) * h.quantity,
            gainLoss: h.gain_loss || 0,
            gainLossPercent: h.gain_loss_percent || 0,
          })) || [],
          recentTrades: recentTrades?.map((t: any) => ({
            symbol: t.symbol,
            type: t.type,
            quantity: t.quantity,
            price: t.price,
            when: t.executed_at,
          })) || [],
        };
      }

      // Get AI response
      const {answer, tokensUsed} = await aiService.askTutor(question, context);

      // Log the interaction for analytics
      await supabase.from('voice_interactions').insert({
        user_id: userId,
        question_text: question,
        response_text: answer,
        tokens_used: tokensUsed,
        interaction_type: 'text',
      });

      logger.info(`AI question answered for user ${userId}`);

      res.json({
        question,
        answer,
        tokensUsed,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get AI-generated portfolio insights
   * GET /api/ai/portfolio-insights
   */
  async getPortfolioInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get user's portfolio and holdings
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (portfolioError || !portfolio) {
        throw createError('Portfolio not found', 404);
      }

      const { data: holdings } = await supabase
        .from('holdings')
        .select('*, stocks(company_name, sector)')
        .eq('portfolio_id', portfolio.id)
        .gt('quantity', 0);

      if (!holdings || holdings.length === 0) {
        return res.json({
          insights: [
            'Start building your portfolio by exploring stocks in the Market section.',
            'Diversification is key - try investing in different sectors.',
            'Paper trading is a great way to learn without risk.',
          ],
          summary: 'Your portfolio is ready for your first investments!',
        });
      }

      // Prepare portfolio data for AI analysis
      const portfolioData = {
        totalValue: portfolio.total_value,
        gainLoss: portfolio.total_gain_loss || 0,
        gainLossPercent: portfolio.total_gain_loss_percent || 0,
        holdings: holdings.map((h: any) => ({
          symbol: h.symbol,
          name: h.stocks?.company_name || h.symbol,
          quantity: h.quantity,
          avgCost: h.avg_buy_price,
          currentPrice: h.current_price,
          gainLoss: h.gain_loss || 0,
          gainLossPercent: h.gain_loss_percent || 0,
          sector: h.stocks?.sector,
        })),
      };

      // Generate insights
      const { insights, summary } = await aiService.generatePortfolioInsights(portfolioData);

      logger.info(`Portfolio insights generated for user ${userId}`);

      res.json({
        insights,
        summary,
        portfolioValue: portfolio.total_value,
        holdingsCount: holdings.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Explain a financial concept
   * POST /api/ai/explain
   */
  async explainConcept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { concept } = req.body;

      if (!concept || concept.trim().length === 0) {
        throw createError('Concept name is required', 400);
      }

      const explanation = await aiService.explainConcept(concept);

      res.json({
        concept,
        explanation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get personalized learning path suggestions
   * GET /api/ai/learning-path
   */
  async getLearningPath(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get completed lessons
      const { data: progress } = await supabase
        .from('user_progress')
        .select('lesson_id, lessons(title)')
        .eq('user_id', userId)
        .eq('completed', true);

      const completedLessons = progress?.map((p: any) => p.lessons?.title).filter(Boolean) || [];

      // Get recent quiz scores
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('score, quizzes(title)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      const quizScores = quizAttempts?.map((q: any) => ({
        topic: q.quizzes?.title || 'General',
        score: q.score,
      })) || [];

      // Get AI suggestions
      const { nextTopics, reasoning } = await aiService.suggestLearningPath(completedLessons, quizScores);

      res.json({
        completedLessons: completedLessons.length,
        nextTopics,
        reasoning,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check for AI service
   * GET /api/ai/health
   */
  async healthCheck(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isHealthy = await aiService.healthCheck();

      res.json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'AI Tutor',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();

