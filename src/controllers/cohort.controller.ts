import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { generateUniqueCode, isValidCodeFormat } from '../utils/cohortCode';
import logger from '../utils/logger';

class CohortController {
  /**
   * Create a new cohort
   * POST /api/cohorts
   */
  async createCohort(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;

      // Only teachers can create cohorts
      if (userType !== 'teacher') {
        throw createError('Only teachers can create cohorts', 403);
      }

      const { name, description, grade, subject, default_budget, allow_custom_budget, restricted_stocks, allowed_sectors } = req.body;

      if (!name) {
        throw createError('Cohort name is required', 400);
      }

      // Generate unique entry code
      const entryCode = await generateUniqueCode();

      // Create cohort
      const { data: cohort, error } = await supabase
        .from('cohorts')
        .insert({
          name,
          description,
          teacher_id: userId,
          grade,
          subject,
          entry_code: entryCode,
          default_budget: default_budget || 10000,
          allow_custom_budget: allow_custom_budget !== false, // default true
          restricted_stocks: restricted_stocks || false,
          allowed_sectors: allowed_sectors || null,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating cohort:', error);
        throw createError('Failed to create cohort', 500);
      }

      logger.info(`Teacher ${userId} created cohort: ${cohort.id} with code ${entryCode}`);

      res.status(201).json({
        message: 'Cohort created successfully',
        cohort,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all cohorts for a teacher
   * GET /api/cohorts
   */
  async getCohorts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;

      // Only teachers can view their cohorts
      if (userType !== 'teacher') {
        throw createError('Only teachers can view cohort management', 403);
      }

      // Get cohorts with member count
      const { data: cohorts, error } = await supabase
        .from('cohorts')
        .select(`
          *,
          cohort_members!cohort_members_cohort_id_fkey(
            id,
            user_id,
            joined_at,
            status
          )
        `)
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching cohorts:', error);
        throw createError('Failed to fetch cohorts', 500);
      }

      // Transform data to include member count
      const cohortsWithCount = cohorts.map(cohort => ({
        ...cohort,
        member_count: cohort.cohort_members?.filter((m: any) => m.status === 'active').length || 0,
      }));

      res.json({
        cohorts: cohortsWithCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cohort members
   * GET /api/cohorts/:cohortId/members
   */
  async getCohortMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;
      const { cohortId } = req.params;

      // Only teachers can view cohort members
      if (userType !== 'teacher') {
        throw createError('Only teachers can view cohort members', 403);
      }

      // Verify teacher owns this cohort
      const { data: cohort, error: cohortError } = await supabase
        .from('cohorts')
        .select('id')
        .eq('id', cohortId)
        .eq('teacher_id', userId)
        .single();

      if (cohortError || !cohort) {
        throw createError('Cohort not found or access denied', 404);
      }

      // Get members with user details
      const { data: members, error } = await supabase
        .from('cohort_members')
        .select(`
          id,
          joined_at,
          status,
          users!cohort_members_user_id_fkey(
            id,
            email,
            name
          )
        `)
        .eq('cohort_id', cohortId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) {
        logger.error('Error fetching cohort members:', error);
        throw createError('Failed to fetch cohort members', 500);
      }

      res.json({
        members,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate cohort entry code
   * PUT /api/cohorts/:cohortId/regenerate-code
   */
  async regenerateCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;
      const { cohortId } = req.params;

      // Only teachers can regenerate codes
      if (userType !== 'teacher') {
        throw createError('Only teachers can regenerate cohort codes', 403);
      }

      // Verify teacher owns this cohort
      const { data: cohort, error: cohortError } = await supabase
        .from('cohorts')
        .select('id, name')
        .eq('id', cohortId)
        .eq('teacher_id', userId)
        .single();

      if (cohortError || !cohort) {
        throw createError('Cohort not found or access denied', 404);
      }

      // Generate new unique code
      const newCode = await generateUniqueCode();

      // Update cohort with new code
      const { data: updatedCohort, error } = await supabase
        .from('cohorts')
        .update({ entry_code: newCode, updated_at: new Date().toISOString() })
        .eq('id', cohortId)
        .select()
        .single();

      if (error) {
        logger.error('Error regenerating code:', error);
        throw createError('Failed to regenerate code', 500);
      }

      logger.info(`Teacher ${userId} regenerated code for cohort ${cohortId}: ${newCode}`);

      res.json({
        message: 'Entry code regenerated successfully',
        cohort: updatedCohort,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a cohort using entry code
   * POST /api/cohorts/join
   */
  async joinCohort(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;
      const { entry_code } = req.body;

      // Only students can join cohorts
      if (userType !== 'student') {
        throw createError('Only students can join cohorts', 403);
      }

      if (!entry_code) {
        throw createError('Entry code is required', 400);
      }

      // Validate code format
      if (!isValidCodeFormat(entry_code)) {
        throw createError('Invalid entry code format', 400);
      }

      // Find cohort by entry code
      const { data: cohort, error: cohortError } = await supabase
        .from('cohorts')
        .select('*')
        .eq('entry_code', entry_code.toUpperCase())
        .single();

      if (cohortError || !cohort) {
        throw createError('Invalid entry code. Please check and try again.', 404);
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('cohort_members')
        .select('id, status')
        .eq('cohort_id', cohort.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        if (existingMember.status === 'active') {
          throw createError('You are already a member of this cohort', 400);
        } else {
          // Reactivate membership
          const { error: updateError } = await supabase
            .from('cohort_members')
            .update({ status: 'active', joined_at: new Date().toISOString() })
            .eq('id', existingMember.id);

          if (updateError) {
            throw createError('Failed to rejoin cohort', 500);
          }

          logger.info(`Student ${userId} rejoined cohort ${cohort.id}`);

          return res.json({
            message: `Welcome back to ${cohort.name}!`,
            cohort: {
              id: cohort.id,
              name: cohort.name,
              description: cohort.description,
              grade: cohort.grade,
              subject: cohort.subject,
            },
          });
        }
      }

      // Get student's current portfolio
      const { data: currentPortfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .is('cohort_id', null) // Get their personal portfolio
        .single();

      if (currentPortfolio) {
        // Get holdings for backup
        const { data: holdings } = await supabase
          .from('holdings')
          .select('*')
          .eq('portfolio_id', currentPortfolio.id);

        // Get recent trades for backup (last 100)
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('portfolio_id', currentPortfolio.id)
          .order('executed_at', { ascending: false })
          .limit(100);

        // Create backup
        await supabase.from('portfolio_backups').insert({
          user_id: userId,
          cohort_id: cohort.id,
          original_portfolio_id: currentPortfolio.id,
          backup_data: {
            budget_amount: currentPortfolio.budget_amount,
            current_cash: currentPortfolio.current_cash,
            total_value: currentPortfolio.total_value,
            holdings: holdings || [],
            recent_trades: trades || []
          },
          is_active: true
        });

        logger.info(`Backed up portfolio for user ${userId} before joining cohort`);
      }

      // Create new cohort portfolio
      const cohortBudget = cohort.default_budget || 10000;
      const { data: cohortPortfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          budget_amount: cohortBudget,
          current_cash: cohortBudget,
          total_value: cohortBudget,
          cohort_id: cohort.id,
          is_cohort_portfolio: true,
          custom_budget_enabled: cohort.allow_custom_budget !== false,
          budget_set_by: cohort.teacher_id
        })
        .select()
        .single();

      if (portfolioError) {
        logger.error('Error creating cohort portfolio:', portfolioError);
        throw createError('Failed to create cohort portfolio', 500);
      }

      // Add student to cohort
      const { error: memberError } = await supabase
        .from('cohort_members')
        .insert({
          cohort_id: cohort.id,
          user_id: userId,
          status: 'active',
        });

      if (memberError) {
        logger.error('Error adding student to cohort:', memberError);
        throw createError('Failed to join cohort', 500);
      }

      logger.info(`Student ${userId} joined cohort ${cohort.id} with new portfolio (₹${cohortBudget})`);

      res.status(201).json({
        message: `Successfully joined ${cohort.name}! Your personal portfolio is backed up and you now have a fresh ₹${cohortBudget.toLocaleString()} budget for this cohort.`,
        cohort: {
          id: cohort.id,
          name: cohort.name,
          description: cohort.description,
          grade: cohort.grade,
          subject: cohort.subject,
        },
        cohort_portfolio: {
          id: cohortPortfolio.id,
          budget: cohortBudget,
          cash: cohortBudget
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student's cohorts
   * GET /api/cohorts/my-cohorts
   */
  async getMyCohorts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;

      // Only students can view their cohorts
      if (userType !== 'student') {
        throw createError('Only students can view their cohort memberships', 403);
      }

      // Get cohorts the student is a member of
      const { data: memberships, error } = await supabase
        .from('cohort_members')
        .select(`
          id,
          joined_at,
          cohorts!cohort_members_cohort_id_fkey(
            id,
            name,
            description,
            grade,
            subject,
            teacher_id,
            users!cohorts_teacher_id_fkey(
              name,
              email
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) {
        logger.error('Error fetching student cohorts:', error);
        throw createError('Failed to fetch cohorts', 500);
      }

      // Transform data
      const cohorts = memberships.map((m: any) => ({
        membership_id: m.id,
        joined_at: m.joined_at,
        ...m.cohorts,
        teacher_name: m.cohorts.users?.name,
        teacher_email: m.cohorts.users?.email,
      }));

      res.json({
        cohorts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave a cohort
   * DELETE /api/cohorts/:cohortId/leave
   */
  async leaveCohort(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userType = req.user!.user_type;
      const { cohortId } = req.params;

      // Only students can leave cohorts
      if (userType !== 'student') {
        throw createError('Only students can leave cohorts', 403);
      }

      // Get cohort portfolio
      const { data: cohortPortfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .eq('is_cohort_portfolio', true)
        .single();

      if (cohortPortfolio) {
        // Delete cohort portfolio's holdings
        await supabase
          .from('holdings')
          .delete()
          .eq('portfolio_id', cohortPortfolio.id);

        // Delete cohort portfolio
        await supabase
          .from('portfolios')
          .delete()
          .eq('id', cohortPortfolio.id);

        logger.info(`Deleted cohort portfolio ${cohortPortfolio.id} for user ${userId}`);
      }

      // Get portfolio backup
      const { data: backup } = await supabase
        .from('portfolio_backups')
        .select('*')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .eq('is_active', true)
        .single();

      if (backup && backup.backup_data) {
        // Restore original portfolio state
        const { data: originalPortfolio } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', backup.original_portfolio_id)
          .single();

        if (originalPortfolio) {
          // Restore cash and values
          await supabase
            .from('portfolios')
            .update({
              current_cash: backup.backup_data.current_cash,
              total_value: backup.backup_data.total_value
            })
            .eq('id', originalPortfolio.id);

          // Restore holdings (delete current, restore backed up)
          await supabase
            .from('holdings')
            .delete()
            .eq('portfolio_id', originalPortfolio.id);

          if (backup.backup_data.holdings && backup.backup_data.holdings.length > 0) {
            const holdingsToRestore = backup.backup_data.holdings.map((h: any) => ({
              ...h,
              id: undefined, // Let DB generate new IDs
              created_at: undefined,
              updated_at: undefined
            }));

            await supabase
              .from('holdings')
              .insert(holdingsToRestore);
          }

          logger.info(`Restored portfolio ${originalPortfolio.id} from backup`);
        }

        // Mark backup as inactive (restored)
        await supabase
          .from('portfolio_backups')
          .update({
            is_active: false,
            restored_at: new Date().toISOString()
          })
          .eq('id', backup.id);
      }

      // Update membership status to removed
      const { error } = await supabase
        .from('cohort_members')
        .update({ status: 'removed' })
        .eq('cohort_id', cohortId)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        logger.error('Error leaving cohort:', error);
        throw createError('Failed to leave cohort', 500);
      }

      logger.info(`Student ${userId} left cohort ${cohortId} and portfolio restored`);

      res.json({
        message: 'Successfully left the cohort. Your original portfolio has been restored.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CohortController();
