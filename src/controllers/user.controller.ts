import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class UserController {
  // Get user profile and settings
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const { data: user, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          alias,
          email,
          phone,
          school,
          age,
          user_type,
          parent_email,
          preferred_language,
          theme,
          notifications_enabled,
          weekly_reports_enabled,
          badge_notifications_enabled,
          market_updates_enabled,
          show_on_leaderboard,
          accessibility_high_contrast,
          accessibility_large_text,
          accessibility_reduced_motion,
          referral_code,
          created_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', error);
        throw createError('Failed to fetch user profile', 500);
      }

      res.json({
        success: true,
        user
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        alias,
        parent_email,
        preferred_language,
        theme,
        phone,
        school,
        age
      } = req.body;

      // Validate alias if provided
      if (alias !== undefined) {
        if (alias && (alias.length < 2 || alias.length > 50)) {
          return next(createError('Alias must be between 2 and 50 characters', 400));
        }
      }

      // Validate email if provided
      if (parent_email !== undefined && parent_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parent_email)) {
          return next(createError('Invalid email format', 400));
        }
      }

      // Validate language
      if (preferred_language && !['en', 'hi', 'hinglish'].includes(preferred_language)) {
        return next(createError('Invalid language selection', 400));
      }

      // Validate theme
      if (theme && !['light', 'dark'].includes(theme)) {
        return next(createError('Invalid theme selection', 400));
      }

      const updateData: any = {};
      if (alias !== undefined) updateData.alias = alias || null;
      if (parent_email !== undefined) updateData.parent_email = parent_email || null;
      if (preferred_language) updateData.preferred_language = preferred_language;
      if (theme) updateData.theme = theme;
      if (phone !== undefined) updateData.phone = phone || null;
      if (school !== undefined) updateData.school = school || null;
      if (age !== undefined) updateData.age = age;
      updateData.updated_at = new Date().toISOString();

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating user profile:', error);
        throw createError('Failed to update profile', 500);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error: any) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  // Update notification settings
  async updateNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        notifications_enabled,
        weekly_reports_enabled,
        badge_notifications_enabled,
        market_updates_enabled
      } = req.body;

      const updateData: any = { updated_at: new Date().toISOString() };
      if (notifications_enabled !== undefined) updateData.notifications_enabled = notifications_enabled;
      if (weekly_reports_enabled !== undefined) updateData.weekly_reports_enabled = weekly_reports_enabled;
      if (badge_notifications_enabled !== undefined) updateData.badge_notifications_enabled = badge_notifications_enabled;
      if (market_updates_enabled !== undefined) updateData.market_updates_enabled = market_updates_enabled;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        logger.error('Error updating notifications:', error);
        throw createError('Failed to update notification settings', 500);
      }

      res.json({
        success: true,
        message: 'Notification settings updated successfully'
      });
    } catch (error: any) {
      logger.error('Update notifications error:', error);
      next(error);
    }
  }

  // Update accessibility settings
  async updateAccessibility(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        accessibility_high_contrast,
        accessibility_large_text,
        accessibility_reduced_motion
      } = req.body;

      const updateData: any = { updated_at: new Date().toISOString() };
      if (accessibility_high_contrast !== undefined) updateData.accessibility_high_contrast = accessibility_high_contrast;
      if (accessibility_large_text !== undefined) updateData.accessibility_large_text = accessibility_large_text;
      if (accessibility_reduced_motion !== undefined) updateData.accessibility_reduced_motion = accessibility_reduced_motion;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        logger.error('Error updating accessibility:', error);
        throw createError('Failed to update accessibility settings', 500);
      }

      res.json({
        success: true,
        message: 'Accessibility settings updated successfully'
      });
    } catch (error: any) {
      logger.error('Update accessibility error:', error);
      next(error);
    }
  }

  // Update privacy settings
  async updatePrivacy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { show_on_leaderboard } = req.body;

      const { error } = await supabase
        .from('users')
        .update({
          show_on_leaderboard: show_on_leaderboard,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Error updating privacy:', error);
        throw createError('Failed to update privacy settings', 500);
      }

      res.json({
        success: true,
        message: 'Privacy settings updated successfully'
      });
    } catch (error: any) {
      logger.error('Update privacy error:', error);
      next(error);
    }
  }

  // Request data export
  async requestDataExport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Get portfolio data
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get holdings
      const { data: holdings } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio?.id);

      // Get transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolio?.id)
        .order('created_at', { ascending: false });

      // Get badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const exportData = {
        user,
        portfolio,
        holdings,
        transactions,
        badges,
        stats,
        exported_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Data export completed',
        data: exportData
      });
    } catch (error: any) {
      logger.error('Data export error:', error);
      next(error);
    }
  }

  // Delete account (mark as deleted, don't actually delete for compliance)
  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { confirmEmail } = req.body;

      // Get user email
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (confirmEmail !== user?.email) {
        return next(createError('Email confirmation does not match', 400));
      }

      // Mark account as deleted (soft delete for compliance)
      const { error } = await supabase
        .from('users')
        .update({
          deleted_at: new Date().toISOString(),
          email: `deleted_${userId}@devion.in`,
          name: 'Deleted User',
          alias: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Error deleting account:', error);
        throw createError('Failed to delete account', 500);
      }

      res.json({
        success: true,
        message: 'Account has been deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete account error:', error);
      next(error);
    }
  }
}

export default new UserController();

