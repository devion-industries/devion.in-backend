import { Response, NextFunction } from 'express';
import { supabaseAdmin as supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class FriendGroupsController {
  /**
   * Create a new friend group
   * POST /api/friend-groups
   */
  async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, description, is_private } = req.body;

      if (!name || name.trim().length === 0) {
        throw createError('Group name is required', 400);
      }

      if (name.length > 100) {
        throw createError('Group name must be 100 characters or less', 400);
      }

      // Generate unique entry code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_group_code');

      if (codeError || !codeData) {
        logger.error('Error generating group code:', codeError);
        throw createError('Failed to generate group code', 500);
      }

      const entryCode = codeData;

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('friend_groups')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          created_by: userId,
          entry_code: entryCode,
          is_private: is_private || false,
        })
        .select()
        .single();

      if (groupError) {
        logger.error('Error creating friend group:', groupError);
        throw createError('Failed to create group', 500);
      }

      // Add creator as first member with 'creator' role
      const { error: memberError } = await supabase
        .from('friend_group_members')
        .insert({
          group_id: group.id,
          user_id: userId,
          role: 'creator',
        });

      if (memberError) {
        logger.error('Error adding creator to group:', memberError);
        // Rollback: delete the group
        await supabase.from('friend_groups').delete().eq('id', group.id);
        throw createError('Failed to create group', 500);
      }

      logger.info(`User ${userId} created friend group: ${group.id} with code ${entryCode}`);

      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          entry_code: group.entry_code,
          created_by: group.created_by,
          is_private: group.is_private,
          created_at: group.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's friend groups
   * GET /api/friend-groups/my-groups
   */
  async getMyGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get all groups user is a member of
      const { data: memberships, error } = await supabase
        .from('friend_group_members')
        .select(`
          role,
          joined_at,
          friend_groups (
            id,
            name,
            description,
            entry_code,
            created_by,
            is_private,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user groups:', error);
        throw createError('Failed to fetch groups', 500);
      }

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        (memberships || []).map(async (membership: any) => {
          const group = membership.friend_groups;
          
          const { count, error: countError } = await supabase
            .from('friend_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (countError) {
            logger.error('Error counting group members:', countError);
          }

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            entry_code: group.entry_code,
            is_private: group.is_private,
            role: membership.role,
            member_count: count || 0,
            joined_at: membership.joined_at,
            created_at: group.created_at,
            is_creator: group.created_by === userId,
          };
        })
      );

      res.json({
        success: true,
        groups: groupsWithCounts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a friend group by entry code
   * POST /api/friend-groups/join
   */
  async joinGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { entry_code } = req.body;

      if (!entry_code) {
        throw createError('Entry code is required', 400);
      }

      const code = entry_code.toUpperCase().trim();

      // Find group by entry code
      const { data: group, error: groupError } = await supabase
        .from('friend_groups')
        .select('*')
        .eq('entry_code', code)
        .single();

      if (groupError || !group) {
        throw createError('Invalid entry code', 404);
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('friend_group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw createError('You are already a member of this group', 400);
      }

      // Check if group is full
      const { count, error: countError } = await supabase
        .from('friend_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      if (countError) {
        logger.error('Error counting group members:', countError);
        throw createError('Failed to join group', 500);
      }

      if (count && count >= group.max_members) {
        throw createError('This group is full', 400);
      }

      // Add user to group
      const { error: joinError } = await supabase
        .from('friend_group_members')
        .insert({
          group_id: group.id,
          user_id: userId,
          role: 'member',
        });

      if (joinError) {
        logger.error('Error joining group:', joinError);
        throw createError('Failed to join group', 500);
      }

      logger.info(`User ${userId} joined friend group: ${group.id}`);

      res.json({
        success: true,
        message: 'Successfully joined group',
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          is_private: group.is_private,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave a friend group
   * DELETE /api/friend-groups/:groupId/leave
   */
  async leaveGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      if (!groupId) {
        throw createError('Group ID is required', 400);
      }

      // Check if user is a member
      const { data: membership, error: memberError } = await supabase
        .from('friend_group_members')
        .select('role, group_id, friend_groups(created_by)')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !membership) {
        throw createError('You are not a member of this group', 404);
      }

      // Check if user is the creator
      const group = membership.friend_groups as any;
      if (group.created_by === userId) {
        throw createError('Group creators cannot leave. Delete the group instead.', 400);
      }

      // Remove user from group
      const { error: leaveError } = await supabase
        .from('friend_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (leaveError) {
        logger.error('Error leaving group:', leaveError);
        throw createError('Failed to leave group', 500);
      }

      logger.info(`User ${userId} left friend group: ${groupId}`);

      res.json({
        success: true,
        message: 'Successfully left group',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get group members
   * GET /api/friend-groups/:groupId/members
   */
  async getGroupMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      // Verify user is a member of this group
      const { data: membership } = await supabase
        .from('friend_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        throw createError('You are not a member of this group', 403);
      }

      // Get all members with user details
      const { data: members, error } = await supabase
        .from('friend_group_members')
        .select(`
          role,
          joined_at,
          users (
            id,
            alias,
            name
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) {
        logger.error('Error fetching group members:', error);
        throw createError('Failed to fetch members', 500);
      }

      const formattedMembers = members.map((member: any) => ({
        user_id: member.users.id,
        alias: member.users.alias,
        name: member.users.name,
        role: member.role,
        joined_at: member.joined_at,
      }));

      res.json({
        success: true,
        members: formattedMembers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get group leaderboard
   * GET /api/friend-groups/:groupId/leaderboard
   */
  async getGroupLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      // Verify user is a member of this group
      const { data: membership } = await supabase
        .from('friend_group_members')
        .select('id, friend_groups(name, description, created_by)')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        throw createError('You are not a member of this group', 403);
      }

      const group = membership.friend_groups as any;

      // Get leaderboard using database function
      const { data, error } = await supabase.rpc('get_group_leaderboard', {
        p_group_id: groupId,
        p_current_user_id: userId,
      });

      if (error) {
        logger.error('Error fetching group leaderboard:', error);
        throw createError('Failed to fetch leaderboard', 500);
      }

      // Get member count
      const { count } = await supabase
        .from('friend_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      res.json({
        success: true,
        group: {
          id: groupId,
          name: group.name,
          description: group.description,
          member_count: count || 0,
          is_creator: group.created_by === userId,
        },
        leaderboard: data || [],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate group entry code (creator only)
   * PUT /api/friend-groups/:groupId/regenerate-code
   */
  async regenerateCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      // Verify user is the creator
      const { data: group, error: groupError } = await supabase
        .from('friend_groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        throw createError('Group not found', 404);
      }

      if (group.created_by !== userId) {
        throw createError('Only the group creator can regenerate the code', 403);
      }

      // Generate new code
      const { data: newCode, error: codeError } = await supabase
        .rpc('generate_group_code');

      if (codeError || !newCode) {
        logger.error('Error generating new code:', codeError);
        throw createError('Failed to generate new code', 500);
      }

      // Update group with new code
      const { error: updateError } = await supabase
        .from('friend_groups')
        .update({ entry_code: newCode })
        .eq('id', groupId);

      if (updateError) {
        logger.error('Error updating group code:', updateError);
        throw createError('Failed to update code', 500);
      }

      logger.info(`User ${userId} regenerated code for group ${groupId}`);

      res.json({
        success: true,
        message: 'Code regenerated successfully',
        entry_code: newCode,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a friend group (creator only)
   * DELETE /api/friend-groups/:groupId
   */
  async deleteGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      // Verify user is the creator
      const { data: group, error: groupError } = await supabase
        .from('friend_groups')
        .select('created_by, name')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        throw createError('Group not found', 404);
      }

      if (group.created_by !== userId) {
        throw createError('Only the group creator can delete the group', 403);
      }

      // Delete group (CASCADE will delete members automatically)
      const { error: deleteError } = await supabase
        .from('friend_groups')
        .delete()
        .eq('id', groupId);

      if (deleteError) {
        logger.error('Error deleting group:', deleteError);
        throw createError('Failed to delete group', 500);
      }

      logger.info(`User ${userId} deleted friend group: ${groupId} (${group.name})`);

      res.json({
        success: true,
        message: 'Group deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FriendGroupsController();

