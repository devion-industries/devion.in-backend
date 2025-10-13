import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { voiceService } from '../services/voice.service';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class VoiceController {
  /**
   * Ask a question and get voice response
   * POST /api/voice/ask
   */
  async askQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { question, voiceType = 'teacher' } = req.body;

      if (!question || question.trim().length === 0) {
        throw createError('Question is required', 400);
      }

      if (question.length > 500) {
        throw createError('Question is too long. Please keep it under 500 characters.', 400);
      }

      // Get user's portfolio context
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*, holdings(*)')
        .eq('user_id', userId)
        .single();

      const context = portfolio ? {
        userId,
        portfolioValue: portfolio.total_value,
        holdings: portfolio.holdings?.map((h: any) => ({
          symbol: h.symbol,
          quantity: h.quantity,
          gainLoss: h.gain_loss_percent || 0,
        })),
      } : undefined;

      // Get voice response
      const result = await voiceService.askQuestionWithVoice(question, context, voiceType);

      // Start voice session if not exists
      const { data: existingSession } = await supabase
        .from('voice_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('ended_at', null)
        .single();

      let sessionId = existingSession?.id;

      if (!sessionId) {
        const { data: newSession } = await supabase
          .from('voice_sessions')
          .insert({
            user_id: userId,
            started_at: new Date().toISOString(),
          })
          .select()
          .single();
        sessionId = newSession?.id;
      }

      // Log the interaction
      await supabase.from('voice_interactions').insert({
        user_id: userId,
        session_id: sessionId,
        question_text: question,
        response_text: result.answer,
        tokens_used: result.tokensUsed,
        character_count: result.characterCount,
        interaction_type: 'voice',
      });

      // Update session with last interaction time
      await supabase
        .from('voice_sessions')
        .update({ last_interaction_at: new Date().toISOString() })
        .eq('id', sessionId);

      logger.info(`Voice question answered for user ${userId}`);

      // Return base64 encoded audio for easy frontend consumption
      res.json({
        question: result.question,
        answer: result.answer,
        audio: voiceService.bufferToBase64(result.audioBuffer),
        audioFormat: result.audioFormat,
        duration: voiceService.estimateAudioDuration(result.characterCount),
        tokensUsed: result.tokensUsed,
        sessionId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get voice explanation for a concept
   * POST /api/voice/explain
   */
  async explainConcept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { concept, voiceType = 'teacher' } = req.body;

      if (!concept || concept.trim().length === 0) {
        throw createError('Concept name is required', 400);
      }

      const result = await voiceService.explainConceptWithVoice(concept, voiceType);

      logger.info(`Voice explanation generated for concept: ${concept}`);

      res.json({
        concept: result.concept,
        explanation: result.explanation,
        audio: voiceService.bufferToBase64(result.audioBuffer),
        audioFormat: result.audioFormat,
        duration: voiceService.estimateAudioDuration(result.explanation.length),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get voice narration of portfolio insights
   * GET /api/voice/portfolio-insights
   */
  async narratePortfolioInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { voiceType = 'teacher' } = req.query;

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
        const fallbackScript = "You haven't made any investments yet. Start exploring stocks in the Market section to build your portfolio!";
        const audioBuffer = await voiceService.textToSpeech(fallbackScript, voiceType as any);
        
        return res.json({
          script: fallbackScript,
          audio: voiceService.bufferToBase64(audioBuffer),
          audioFormat: 'audio/mpeg',
          duration: voiceService.estimateAudioDuration(fallbackScript.length),
        });
      }

      // Prepare portfolio data
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

      // Get AI insights
      const { insights, summary } = await require('../services/ai.service').aiService.generatePortfolioInsights(portfolioData);

      // Generate voice narration
      const result = await voiceService.narratePortfolioInsights(insights, summary, voiceType as any);

      logger.info(`Portfolio insights narration generated for user ${userId}`);

      res.json({
        script: result.script,
        audio: voiceService.bufferToBase64(result.audioBuffer),
        audioFormat: result.audioFormat,
        duration: voiceService.estimateAudioDuration(result.script.length),
        insights,
        summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Convert text to speech (generic TTS endpoint)
   * POST /api/voice/tts
   */
  async textToSpeech(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text, voiceType = 'teacher' } = req.body;

      if (!text || text.trim().length === 0) {
        throw createError('Text is required', 400);
      }

      if (text.length > 5000) {
        throw createError('Text is too long. Maximum 5000 characters allowed.', 400);
      }

      const audioBuffer = await voiceService.textToSpeech(text, voiceType);

      res.json({
        audio: voiceService.bufferToBase64(audioBuffer),
        audioFormat: 'audio/mpeg',
        duration: voiceService.estimateAudioDuration(text.length),
        characterCount: text.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start a new voice session
   * POST /api/voice/session/start
   */
  async startSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // End any existing open sessions
      await supabase
        .from('voice_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('ended_at', null);

      // Create new session
      const { data: session, error } = await supabase
        .from('voice_sessions')
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw createError('Failed to start voice session', 500);
      }

      logger.info(`Voice session started for user ${userId}`);

      res.json({
        sessionId: session.id,
        startedAt: session.started_at,
        message: 'Voice session started successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * End current voice session
   * POST /api/voice/session/end
   */
  async endSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.body;

      if (!sessionId) {
        throw createError('Session ID is required', 400);
      }

      // End the session
      const { data: session, error } = await supabase
        .from('voice_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !session) {
        throw createError('Session not found or already ended', 404);
      }

      // Get session statistics
      const { data: interactions } = await supabase
        .from('voice_interactions')
        .select('*')
        .eq('session_id', sessionId);

      const totalQuestions = interactions?.length || 0;
      const totalTokens = interactions?.reduce((sum: number, i: any) => sum + (i.tokens_used || 0), 0) || 0;

      logger.info(`Voice session ended for user ${userId} - ${totalQuestions} questions asked`);

      res.json({
        sessionId: session.id,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        totalQuestions,
        totalTokens,
        message: 'Voice session ended successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available voices
   * GET /api/voice/voices
   */
  async getVoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const voices = await voiceService.getAvailableVoices();

      res.json({
        voices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's voice usage statistics
   * GET /api/voice/usage
   */
  async getUsageStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const stats = await voiceService.getUserUsageStats(userId);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check for voice service
   * GET /api/voice/health
   */
  async healthCheck(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isHealthy = await voiceService.healthCheck();

      res.json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'Voice AI (ElevenLabs)',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const voiceController = new VoiceController();

