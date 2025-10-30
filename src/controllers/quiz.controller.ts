import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class QuizController {
  /**
   * Get all available quizzes
   * GET /api/quizzes
   */
  async getAllQuizzes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get all quizzes with question count
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          difficulty,
          passing_score,
          created_at
        `)
        .order('created_at', { ascending: true });

      if (quizzesError) {
        throw createError('Failed to fetch quizzes', 500);
      }

      // Get question count for each quiz
      const quizzesWithCount = await Promise.all(
        quizzes.map(async (quiz) => {
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id);

          // Get user's best score for this quiz
          const { data: bestAttempt } = await supabase
            .from('quiz_attempts')
            .select('score')
            .eq('user_id', userId)
            .eq('quiz_id', quiz.id)
            .order('score', { ascending: false })
            .limit(1)
            .single();

          return {
            ...quiz,
            question_count: count || 0,
            best_score: bestAttempt?.score || null,
          };
        })
      );

      res.json({
        quizzes: quizzesWithCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz with questions
   * GET /api/quizzes/:quizId
   */
  async getQuizQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quizId } = req.params;

      // Get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError || !quiz) {
        throw createError('Quiz not found', 404);
      }

      // Get quiz questions (without revealing correct answers)
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id, quiz_id, question_text, options')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true });

      if (questionsError) {
        throw createError('Failed to fetch quiz questions', 500);
      }

      res.json({
        quiz,
        questions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit quiz attempt
   * POST /api/quizzes/submit
   */
  async submitQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { quiz_id, answers, time_taken_seconds } = req.body;

      if (!quiz_id || !Array.isArray(answers)) {
        throw createError('Invalid quiz submission', 400);
      }

      // Get quiz questions with correct answers
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz_id)
        .order('created_at', { ascending: true });

      if (questionsError || !questions || questions.length === 0) {
        throw createError('Quiz not found', 404);
      }

      if (answers.length !== questions.length) {
        throw createError('Answer count does not match question count', 400);
      }

      // Calculate score and track correct answers
      let correct = 0;
      const correctAnswers: boolean[] = [];

      questions.forEach((question, index) => {
        const isCorrect = answers[index] === question.correct_answer_index;
        if (isCorrect) {
          correct++;
        }
        correctAnswers.push(isCorrect);
      });

      // Save quiz attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id,
          score: correct,
          total_questions: questions.length,
          time_taken_seconds: time_taken_seconds || null,
        })
        .select()
        .single();

      if (attemptError) {
        logger.error('Error saving quiz attempt:', attemptError);
        throw createError('Failed to save quiz attempt', 500);
      }

      const percentage = Math.round((correct / questions.length) * 100);

      logger.info(`User ${userId} completed quiz ${quiz_id}: ${correct}/${questions.length}`);

      res.json({
        attempt,
        correct_answers: correctAnswers,
        score: correct,
        total_questions: questions.length,
        percentage,
        passed: percentage >= 70,
        message: percentage >= 70
          ? 'Awesome! You passed! 🎉'
          : 'Good try! Review and try again to improve.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's quiz attempt history
   * GET /api/quizzes/attempts
   */
  async getQuizAttempts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get user's quiz attempts with quiz details
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quizzes (
            title,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (attemptsError) {
        throw createError('Failed to fetch quiz attempts', 500);
      }

      res.json({
        attempts: attempts || [],
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuizController();



