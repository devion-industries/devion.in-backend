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

      // Get all users with their portfolio stats
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          alias,
          created_at,
          portfolios (
            total_value,
            budget_amount,
            updated_at
          ),
          user_badges (
            id
          )
        `)
        .eq('user_type', 'student')
        .limit(limit);

      if (error) throw error;

      // Calculate returns and rank users
      const rankedUsers = users
        .map((user: any) => {
          const portfolio = user.portfolios?.[0];
          const currentValue = portfolio?.total_value || 0;
          const initialBalance = portfolio?.budget_amount || 10000;
          const portfolioReturn = ((currentValue - initialBalance) / initialBalance) * 100;

          return {
            user_id: user.id,
            alias: user.alias || 'Anonymous',
            portfolio_return: parseFloat(portfolioReturn.toFixed(2)),
            badges_count: user.user_badges?.length || 0,
            login_streak: 0, // TODO: Add user_stats table for login streak tracking
            last_updated: portfolio?.updated_at || user.created_at
          };
        })
        .sort((a: any, b: any) => {
          // Primary: portfolio return
          if (b.portfolio_return !== a.portfolio_return) {
            return b.portfolio_return - a.portfolio_return;
          }
          // Tiebreaker: badges
          if (b.badges_count !== a.badges_count) {
            return b.badges_count - a.badges_count;
          }
          // Tiebreaker: streak
          return b.login_streak - a.login_streak;
        })
        .map((user: any, index: number) => ({
          ...user,
          rank: index + 1
        }));

      res.json({
        success: true,
        leaderboard: rankedUsers
      });
    } catch (error: any) {
      logger.error('Get global leaderboard error:', error);
      next(createError('Failed to fetch global leaderboard', 500));
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

      // Verify user is member of this cohort
      const { data: membership, error: memberError } = await supabase
        .from('cohort_members')
        .select('id')
        .eq('cohort_id', cohortId)
        .eq('user_id', userId)
        .single();

      if (memberError || !membership) {
        return next(createError('You are not a member of this cohort', 403));
      }

      // Get cohort details
      const { data: cohort, error: cohortError } = await supabase
        .from('cohorts')
        .select(`
          id,
          name,
          grade,
          subject,
          organization_name,
          teacher:users!cohorts_teacher_id_fkey (
            alias
          )
        `)
        .eq('id', cohortId)
        .single();

      if (cohortError) throw cohortError;

      // Get all members with their stats
      const { data: members, error: membersError } = await supabase
        .from('cohort_members')
        .select(`
          user_id,
          users (
            id,
            alias,
            portfolios (
              total_value,
              budget_amount,
              updated_at
            ),
            user_badges (
              id
            )
          )
        `)
        .eq('cohort_id', cohortId)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Calculate rankings
      const rankedMembers = members
        .map((member: any) => {
          const user = member.users;
          const portfolio = user.portfolios?.[0];
          const currentValue = portfolio?.total_value || 0;
          const initialBalance = portfolio?.budget_amount || 10000;
          const portfolioReturn = ((currentValue - initialBalance) / initialBalance) * 100;

          return {
            user_id: user.id,
            alias: user.alias || 'Anonymous',
            portfolio_return: parseFloat(portfolioReturn.toFixed(2)),
            badges_count: user.user_badges?.length || 0,
            login_streak: 0, // TODO: Add user_stats table for login streak tracking
            is_me: user.id === userId
          };
        })
        .sort((a: any, b: any) => {
          if (b.portfolio_return !== a.portfolio_return) {
            return b.portfolio_return - a.portfolio_return;
          }
          if (b.badges_count !== a.badges_count) {
            return b.badges_count - a.badges_count;
          }
          return b.login_streak - a.login_streak;
        })
        .map((user: any, index: number) => ({
          ...user,
          rank: index + 1
        }));

      res.json({
        success: true,
        cohort: {
          id: cohort.id,
          name: cohort.name,
          grade: cohort.grade,
          subject: cohort.subject,
          organization: cohort.organization_name,
          teacher: (cohort.teacher as any)?.[0]?.alias || 'Teacher',
          member_count: rankedMembers.length
        },
        leaderboard: rankedMembers
      });
    } catch (error: any) {
      logger.error('Get cohort leaderboard error:', error);
      next(createError('Failed to fetch cohort leaderboard', 500));
    }
  }

  // Get friends leaderboard
  async getFriendsLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      // Get user's friends (both directions)
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_id
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Extract friend IDs
      const friendIds = friendships.map((f: any) => 
        f.user_id === userId ? f.friend_id : f.user_id
      );

      // Include current user in the list
      const allUserIds = [userId, ...friendIds];

      // Get stats for all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          alias,
          portfolios (
            total_value,
            budget_amount,
            updated_at
          ),
          user_badges (
            id
          )
        `)
        .in('id', allUserIds);

      if (usersError) throw usersError;

      // Calculate rankings
      const rankedFriends = users
        .map((user: any) => {
          const portfolio = user.portfolios?.[0];
          const currentValue = portfolio?.total_value || 0;
          const initialBalance = portfolio?.budget_amount || 10000;
          const portfolioReturn = ((currentValue - initialBalance) / initialBalance) * 100;

          return {
            user_id: user.id,
            alias: user.alias || 'Anonymous',
            portfolio_return: parseFloat(portfolioReturn.toFixed(2)),
            badges_count: user.user_badges?.length || 0,
            login_streak: 0, // TODO: Add user_stats table for login streak tracking
            is_me: user.id === userId
          };
        })
        .sort((a: any, b: any) => {
          if (b.portfolio_return !== a.portfolio_return) {
            return b.portfolio_return - a.portfolio_return;
          }
          if (b.badges_count !== a.badges_count) {
            return b.badges_count - a.badges_count;
          }
          return b.login_streak - a.login_streak;
        })
        .map((user: any, index: number) => ({
          ...user,
          rank: index + 1
        }));

      res.json({
        success: true,
        leaderboard: rankedFriends
      });
    } catch (error: any) {
      logger.error('Get friends leaderboard error:', error);
      next(createError('Failed to fetch friends leaderboard', 500));
    }
  }

  // Get current user's rank across all leaderboards
  async getMyRank(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      // Get user's stats
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          alias,
          referral_code,
          portfolios (
            total_value,
            budget_amount
          ),
          user_badges (
            id
          )
        `)
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const portfolio = user.portfolios?.[0];
      const currentValue = portfolio?.total_value || 0;
      const initialBalance = portfolio?.budget_amount || 10000;
      const portfolioReturn = ((currentValue - initialBalance) / initialBalance) * 100;

      // Get global rank - count users with better returns
      const { count: betterUsers, error: rankError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('user_type', 'student')
        .gte('portfolios.total_value', currentValue);

      const globalRank = (betterUsers || 0) + 1;

      res.json({
        success: true,
        my_rank: {
          rank: globalRank,
          alias: user.alias || 'Anonymous',
          portfolio_return: parseFloat(portfolioReturn.toFixed(2)),
          badges_count: user.user_badges?.length || 0,
          login_streak: 0, // TODO: Add user_stats table for login streak tracking
          referral_code: user.referral_code
        }
      });
    } catch (error: any) {
      logger.error('Get my rank error:', error);
      next(createError('Failed to fetch your rank', 500));
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

      // Find user with this referral code
      const { data: friend, error: friendError } = await supabase
        .from('users')
        .select('id, alias')
        .eq('referral_code', referral_code.toUpperCase())
        .single();

      if (friendError || !friend) {
        return next(createError('Invalid referral code', 404));
      }

      if (friend.id === userId) {
        return next(createError('You cannot add yourself as a friend', 400));
      }

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        return next(createError('You are already friends with this user', 400));
      }

      // Create friendship (auto-accepted)
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friend.id,
          status: 'accepted'
        });

      if (insertError) throw insertError;

      res.json({
        success: true,
        message: `Added ${friend.alias} as a friend!`,
        friend: {
          id: friend.id,
          alias: friend.alias
        }
      });
    } catch (error: any) {
      logger.error('Add friend error:', error);
      next(createError('Failed to add friend', 500));
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

      // Delete friendship (either direction)
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Friend removed successfully'
      });
    } catch (error: any) {
      logger.error('Remove friend error:', error);
      next(createError('Failed to remove friend', 500));
    }
  }

  // Get user's friends list
  async getFriends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_id,
          created_at
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Get friend user details
      const friendIds = friendships.map((f: any) => 
        f.user_id === userId ? f.friend_id : f.user_id
      );

      if (friendIds.length === 0) {
        return res.json({
          success: true,
          friends: []
        });
      }

      const { data: friends, error: friendsError } = await supabase
        .from('users')
        .select('id, alias')
        .in('id', friendIds);

      if (friendsError) throw friendsError;

      res.json({
        success: true,
        friends: friends.map((f: any) => ({
          id: f.id,
          alias: f.alias || 'Anonymous'
        }))
      });
    } catch (error: any) {
      logger.error('Get friends error:', error);
      next(createError('Failed to fetch friends', 500));
    }
  }
}

export default new LeaderboardController();

