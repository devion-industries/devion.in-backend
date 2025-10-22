import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { supabase, supabaseAdmin } from '../config/database';
import { config } from '../config/env';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class AuthController {
  async signup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name, phone, school, age, initial_budget, user_type } = req.body;
      
      // Validate input
      if (!email || !password || !name) {
        throw createError('Email, password, and name are required', 400);
      }
      
      // Validate name length
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        throw createError('Name must be between 2 and 100 characters', 400);
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw createError('Invalid email format', 400);
      }
      
      // Validate password length
      if (password.length < 6) {
        throw createError('Password must be at least 6 characters', 400);
      }
      
      // Validate user_type
      const accountType = user_type || 'student';
      if (!['student', 'teacher'].includes(accountType)) {
        throw createError('Invalid user type. Must be student or teacher', 400);
      }
      
      // Validate budget if provided (only for students)
      const budgetAmount = accountType === 'student' ? (initial_budget || 10000) : 0;
      if (accountType === 'student' && (budgetAmount < 1000 || budgetAmount > 10000000)) {
        throw createError('Budget must be between ₹1,000 and ₹1,00,00,000', 400);
      }
      
      // Create auth user in Supabase Auth (automatically sends verification email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            user_type: accountType
          },
          emailRedirectTo: `${process.env.FRONTEND_URL || 'https://invested-demo.vercel.app'}/login`
        }
      });
      
      if (authError) {
        throw createError(authError.message, 400);
      }
      
      if (!authData.user) {
        throw createError('Failed to create user', 500);
      }
      
      // Generate referral code (required field)
      // Format: First 6 chars of name + last 4 chars of UUID
      const namePrefix = trimmedName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6).padEnd(6, 'X');
      const uuidSuffix = authData.user.id.split('-').pop()!.substring(0, 4).toUpperCase();
      const referralCode = `${namePrefix}-${uuidSuffix}`;
      
      // Create user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name: trimmedName,
          phone,
          school,
          age,
          user_type: accountType,
          referral_code: referralCode
        })
        .select()
        .single();
      
      if (userError) {
        // Rollback auth user if profile creation fails
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          logger.error('Failed to rollback user after profile creation error', deleteError);
        }
        throw createError('Failed to create user profile', 500);
      }
      
      // Create default portfolio only for students
      if (accountType === 'student') {
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'free')
          .single();
        
        await supabase.from('portfolios').insert({
          user_id: user.id,
          budget_amount: budgetAmount,
          current_cash: budgetAmount,
          total_value: budgetAmount,
          custom_budget_enabled: true,
          budget_set_by: user.id // User set their own budget
        });
      }
      
      // Create user settings
      await supabase.from('user_settings').insert({
        user_id: user.id
      });
      
      // Create user profile
      await supabase.from('user_profiles').insert({
        user_id: user.id
      });
      
      logger.info(`New ${accountType} user registered: ${email} - verification email sent`);
      
      res.status(201).json({
        message: 'Account created successfully. Please check your email to verify your account.',
        requiresVerification: true,
        email: email,
        user_type: accountType
      });
    } catch (error) {
      next(error);
    }
  }
  
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw createError('Email and password are required', 400);
      }
      
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        throw createError('Invalid credentials', 401);
      }
      
      // Get user details
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      // Update login streak for students
      if (user.user_type === 'student') {
        try {
          await supabase.rpc('update_login_streak', { p_user_id: user.id });
        } catch (streakError) {
          logger.error('Failed to update login streak:', streakError);
          // Don't fail login if streak update fails
        }
      }
      
      // Generate JWT token with user_type
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.user_type || 'student' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );
      
      logger.info(`${user.user_type || 'student'} user logged in: ${email}`);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          user_type: user.user_type || 'student',
          onboarding_completed: user.onboarding_completed || false
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }
  
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // In JWT-based auth, logout is handled client-side by removing the token
      logger.info(`User logged out: ${req.user?.email}`);
      
      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async completeOnboarding(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { alias } = req.body;
      const userId = req.user!.id;
      
      const updateData: any = {
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      // Validate and set alias if provided
      if (alias) {
        const trimmedAlias = alias.trim();
        
        if (trimmedAlias.length < 2 || trimmedAlias.length > 50) {
          return next(createError('Display name must be between 2 and 50 characters', 400));
        }

        // Check if alias is available
        const { data: isAvailable, error: checkError } = await supabase
          .rpc('is_alias_available', {
            p_alias: trimmedAlias,
            p_user_id: userId
          });

        if (checkError) {
          logger.error('Error checking alias availability:', checkError);
          throw createError('Failed to validate display name', 500);
        }

        if (!isAvailable) {
          return next(createError('This display name is already taken. Please choose another one.', 409));
        }

        updateData.alias = trimmedAlias;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        logger.error('Error completing onboarding:', error);
        throw createError('Failed to update onboarding status', 500);
      }
      
      logger.info(`User completed onboarding: ${req.user!.email}${updateData.alias ? ` with alias: ${updateData.alias}` : ''}`);
      
      res.json({
        message: 'Onboarding completed successfully',
        user: data
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, phone, school } = req.body;
      
      const { data, error } = await supabase
        .from('users')
        .update({ name, phone, school, updated_at: new Date().toISOString() })
        .eq('id', req.user!.id)
        .select()
        .single();
      
      if (error) {
        throw createError('Failed to update profile', 500);
      }
      
      res.json({
        message: 'Profile updated successfully',
        user: data
      });
    } catch (error) {
      next(error);
    }
  }
  
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw createError('Refresh token required', 400);
      }
      
      // Verify and generate new token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
      
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        config.jwt.secret,
        { expiresIn: '7d' }
      );
      
      res.json({
        token: newToken
      });
    } catch (error) {
      next(createError('Invalid refresh token', 401));
    }
  }
}

export const authController = new AuthController();

