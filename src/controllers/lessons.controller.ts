import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class LessonsController {
  /**
   * Get all modules with user progress
   */
  async getModules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get all published modules
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (modulesError) {
        throw createError('Failed to fetch modules', 500);
      }

      // Get user's progress for each module
      const { data: progress, error: progressError } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        logger.error('Error fetching module progress:', progressError);
      }

      // Merge progress data with modules
      const modulesWithProgress = modules.map(module => {
        const moduleProgress = progress?.find(p => p.module_id === module.id);
        return {
          ...module,
          progress: moduleProgress || {
            lessons_completed: 0,
            lessons_total: 0,
            progress_percentage: 0,
            last_accessed: null
          }
        };
      });

      res.json({
        modules: modulesWithProgress,
        total_modules: modules.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lessons for a specific module
   */
  async getLessonsByModule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { moduleId } = req.params;

      // Get module details
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .eq('is_published', true)
        .single();

      if (moduleError || !module) {
        throw createError('Module not found', 404);
      }

      // Get all lessons in this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_tags:lesson_tag_assignments(
            tag:lesson_tags(*)
          )
        `)
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        throw createError('Failed to fetch lessons', 500);
      }

      // Get user's progress for these lessons
      const lessonIds = lessons.map(l => l.id);
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);

      if (progressError) {
        logger.error('Error fetching lesson progress:', progressError);
      }

      // Merge progress with lessons
      const lessonsWithProgress = lessons.map(lesson => {
        const lessonProgress = progress?.find(p => p.lesson_id === lesson.id);
        return {
          ...lesson,
          progress: lessonProgress || {
            status: 'not_started',
            current_card_index: 0,
            cards_completed: 0,
            quiz_score: null,
            last_accessed: null
          }
        };
      });

      res.json({
        module,
        lessons: lessonsWithProgress,
        total_lessons: lessons.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific lesson with cards and quiz
   */
  async getLesson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params;

      // Get lesson details
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          module:modules(*),
          lesson_tags:lesson_tag_assignments(
            tag:lesson_tags(*)
          )
        `)
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError || !lesson) {
        throw createError('Lesson not found', 404);
      }

      // Get lesson cards
      const { data: cards, error: cardsError } = await supabase
        .from('lesson_cards')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (cardsError) {
        throw createError('Failed to fetch lesson cards', 500);
      }

      // Get quiz questions
      const { data: quiz, error: quizError } = await supabase
        .from('lesson_quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (quizError) {
        throw createError('Failed to fetch quiz', 500);
      }

      // Get user's progress for this lesson
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = no rows
        logger.error('Error fetching progress:', progressError);
      }

      res.json({
        lesson: {
          ...lesson,
          cards,
          quiz,
          progress: progress || {
            status: 'not_started',
            current_card_index: 0,
            cards_completed: 0,
            time_spent: 0,
            quiz_score: null,
            quiz_attempts: 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start a lesson (create initial progress record)
   */
  async startLesson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params;

      // Check if lesson exists
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, module_id')
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError || !lesson) {
        throw createError('Lesson not found', 404);
      }

      // Create or update progress
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single();

      if (progressError) {
        throw createError('Failed to start lesson', 500);
      }

      // Update module progress
      const { error: moduleProgressError } = await supabase
        .rpc('calculate_module_progress', {
          p_user_id: userId,
          p_module_id: lesson.module_id
        });

      if (moduleProgressError) {
        logger.error('Error updating module progress:', moduleProgressError);
      }

      logger.info(`User ${userId} started lesson ${lessonId}`);

      res.json({
        message: 'Lesson started',
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update lesson progress (card navigation)
   */
  async updateLessonProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params;
      const { current_card_index, cards_completed, time_spent } = req.body;

      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .update({
          current_card_index: current_card_index || 0,
          cards_completed: cards_completed || 0,
          time_spent: time_spent || 0,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (progressError) {
        throw createError('Failed to update progress', 500);
      }

      res.json({
        message: 'Progress updated',
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params;

      // Get lesson to find module_id
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, module_id')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lesson) {
        throw createError('Lesson not found', 404);
      }

      // Update progress to completed
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (progressError) {
        throw createError('Failed to complete lesson', 500);
      }

      logger.info(`User ${userId} completed lesson ${lessonId}`);

      res.json({
        message: 'Lesson completed! 🎉',
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params;
      const { answers } = req.body; // array of answer indices

      // Get quiz questions
      const { data: quizQuestions, error: quizError } = await supabase
        .from('lesson_quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (quizError || !quizQuestions) {
        throw createError('Quiz not found', 404);
      }

      // Calculate score
      let correct = 0;
      quizQuestions.forEach((question, index) => {
        if (answers[index] === question.correct_answer) {
          correct++;
        }
      });

      const score = (correct / quizQuestions.length) * 100;

      // Update progress
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .update({
          quiz_score: score,
          quiz_attempts: supabase.rpc('increment', { row_id: lessonId })
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (progressError) {
        logger.error('Error updating quiz score:', progressError);
      }

      res.json({
        score,
        correct_answers: correct,
        total_questions: quizQuestions.length,
        passed: score >= 70,
        message: score >= 70 ? 'Great job! You passed! 🎉' : 'Keep practicing! Try again to improve your score.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's overall learning progress
   */
  async getOverallProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get all module progress
      const { data: moduleProgress, error: moduleError } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', userId);

      if (moduleError) {
        throw createError('Failed to fetch progress', 500);
      }

      // Get total lessons
      const { count: totalLessons, error: lessonsCountError } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      if (lessonsCountError) {
        throw createError('Failed to count lessons', 500);
      }

      // Get completed lessons
      const { count: completedLessons, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (completedError) {
        throw createError('Failed to count completed lessons', 500);
      }

      // Get in-progress lessons
      const { count: inProgressLessons, error: inProgressError } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'in_progress');

      if (inProgressError) {
        logger.error('Error counting in-progress lessons:', inProgressError);
      }

      const overallPercentage = (totalLessons || 0) > 0 
        ? ((completedLessons || 0) / (totalLessons || 0)) * 100 
        : 0;

      res.json({
        overall_progress: {
          total_lessons: totalLessons || 0,
          completed_lessons: completedLessons || 0,
          in_progress_lessons: inProgressLessons || 0,
          percentage: Math.round(overallPercentage)
        },
        module_progress: moduleProgress || []
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search lessons
   */
  async searchLessons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { q, tag, difficulty } = req.query;

      let query = supabase
        .from('lessons')
        .select(`
          *,
          module:modules(id, title, icon, color),
          lesson_tags:lesson_tag_assignments(
            tag:lesson_tags(*)
          )
        `)
        .eq('is_published', true);

      // Text search
      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Filter by difficulty
      if (difficulty) {
        query = query.eq('difficulty_level', parseInt(difficulty as string));
      }

      const { data: lessons, error: lessonsError } = await query
        .order('order_index', { ascending: true })
        .limit(20);

      if (lessonsError) {
        throw createError('Failed to search lessons', 500);
      }

      // Get progress for these lessons
      const lessonIds = lessons.map(l => l.id);
      const { data: progress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);

      // Merge progress
      const lessonsWithProgress = lessons.map(lesson => {
        const lessonProgress = progress?.find(p => p.lesson_id === lesson.id);
        return {
          ...lesson,
          progress: lessonProgress || { status: 'not_started' }
        };
      });

      res.json({
        lessons: lessonsWithProgress,
        count: lessons.length
      });
    } catch (error) {
      next(error);
    }
  }
}

export const lessonsController = new LessonsController();

