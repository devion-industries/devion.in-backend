import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class LeaderboardController {
  // Get global leaderboard rankings
  async getGlobalLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const userId = req.user?.id;

      // Direct SQL query to get all data in one go
      const { data, error } = await supabase.rpc('get_global_leaderboard', {
        user_limit: limit,
        current_user_id: userId
      });

      if (error) {
        logger.error('Error fetching global leaderboard:', error);
        throw createError('Failed to fetch leaderboard data', 500);
      }

      res.json({
        success: true,
        leaderboard: data || []
      });
    } catch (error: any) {
      logger.error('Global leaderboard error:', error);
      next(error);
    }
  }

  // Get cohort leaderboard rankings
  async getCohortLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cohortId } = req.params;
      const userId = req.user?.id;

      if (!cohortId) {
        return next(createError('Cohort ID is required', 400));
      }

      // Verify membership
      const { data: membership, error: memberError } = await supabase
        .from('cohort_members')
        .select('id')
        .eq('cohort_id', cohortId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (memberError || !membership) {
        return next(createError('You are not a member of this cohort', 403));
      }

      // Get cohort info
      const { data: cohort, error: cohortError } = await supabase
        .from('cohorts')
        .select('id, name, grade, subject, organization_name, teacher_id')
        .eq('id', cohortId)
        .single();

      if (cohortError) {
        logger.error('Error fetching cohort:', cohortError);
        throw createError('Cohort not found', 404);
      }

      // Get teacher name
      const { data: teacher } = await supabase
        .from('users')
        .select('alias, name')
        .eq('id', cohort.teacher_id)
        .single();

      // Get leaderboard data
      const { data, error } = await supabase.rpc('get_cohort_leaderboard', {
        p_cohort_id: cohortId,
        current_user_id: userId
      });

      if (error) {
        logger.error('Error fetching cohort leaderboard:', error);
        throw createError('Failed to fetch cohort leaderboard', 500);
      }

      res.json({
        success: true,
        cohort: {
          id: cohort.id,
          name: cohort.name,
          grade: cohort.grade,
          subject: cohort.subject,
          organization: cohort.organization_name,
          teacher: teacher?.alias || teacher?.name || 'Unknown',
          member_count: data?.length || 0
        },
        leaderboard: data || []
      });
    } catch (error: any) {
      logger.error('Cohort leaderboard error:', error);
      next(error);
    }
  }

  // Get friends leaderboard rankings
  async getFriendsLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const { data, error } = await supabase.rpc('get_friends_leaderboard', {
        current_user_id: userId
      });

      if (error) {
        logger.error('Error fetching friends leaderboard:', error);
        throw createError('Failed to fetch friends leaderboard', 500);
      }

      res.json({
        success: true,
        leaderboard: data || []
      });
    } catch (error: any) {
      logger.error('Friends leaderboard error:', error);
      next(error);
    }
  }

  // Get current user's rank
  async getMyRank(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const { data, error } = await supabase.rpc('get_my_rank', {
        current_user_id: userId
      });

      if (error) {
        logger.error('Error fetching my rank:', error);
        throw createError('Failed to fetch your rank', 500);
      }

      if (!data || data.length === 0) {
        // Return default data for new users
        const { data: userData } = await supabase
          .from('users')
          .select('alias, referral_code')
          .eq('id', userId)
          .single();

        return res.json({
          success: true,
          my_rank: {
            rank: 1,
            alias: userData?.alias || 'Anonymous',
            portfolio_return: 0.00,
            badges_count: 0,
            login_streak: 0,
            referral_code: userData?.referral_code || ''
          }
        });
      }

      res.json({
        success: true,
        my_rank: data[0]
      });
    } catch (error: any) {
      logger.error('Get my rank error:', error);
      next(error);
    }
  }

  // Add friend by referral code
  async addFriend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { referral_code } = req.body;

      if (!referral_code) {
        return next(createError('Referral code is required', 400));
      }

      // Find friend by referral code
      const { data: friend, error: friendError } = await supabase
        .from('users')
        .select('id, alias, name')
        .eq('referral_code', referral_code)
        .single();

      if (friendError || !friend) {
        return next(createError('Invalid referral code', 404));
      }

      if (friend.id === userId) {
        return next(createError('You cannot add yourself as a friend', 400));
      }

      // Check if already friends
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        return next(createError('You are already friends with this user', 400));
      }

      // Add friendship (bidirectional)
      const { error: insertError } = await supabase
        .from('friendships')
        .insert([
          { user_id: userId, friend_id: friend.id, status: 'accepted' },
          { user_id: friend.id, friend_id: userId, status: 'accepted' }
        ]);

      if (insertError) {
        logger.error('Error adding friend:', insertError);
        throw createError('Failed to add friend', 500);
      }

      res.json({
        success: true,
        message: 'Friend added successfully',
        friend: {
          id: friend.id,
          alias: friend.alias || friend.name || 'Anonymous'
        }
      });
    } catch (error: any) {
      logger.error('Add friend error:', error);
      next(error);
    }
  }

  // Remove friend
  async removeFriend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { friendId } = req.params;

      if (!friendId) {
        return next(createError('Friend ID is required', 400));
      }

      // Delete both directions of friendship
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) {
        logger.error('Error removing friend:', error);
        throw createError('Failed to remove friend', 500);
      }

      res.json({
        success: true,
        message: 'Friend removed successfully'
      });
    } catch (error: any) {
      logger.error('Remove friend error:', error);
      next(error);
    }
  }

  // Get friends list
  async getFriends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) {
        logger.error('Error fetching friends:', error);
        throw createError('Failed to fetch friends', 500);
      }

      const friendIds = friendships.map(f => f.friend_id);

      if (friendIds.length === 0) {
        return res.json({
          success: true,
          friends: []
        });
      }

      const { data: friends, error: friendsError } = await supabase
        .from('users')
        .select('id, alias, name')
        .in('id', friendIds);

      if (friendsError) {
        logger.error('Error fetching friend details:', friendsError);
        throw createError('Failed to fetch friend details', 500);
      }

      res.json({
        success: true,
        friends: friends.map(f => ({
          id: f.id,
          alias: f.alias || f.name || 'Anonymous'
        }))
      });
    } catch (error: any) {
      logger.error('Get friends error:', error);
      next(error);
    }
  }
}

export default new LeaderboardController();
