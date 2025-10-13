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
      const { email, password, name, phone, school, age, initial_budget } = req.body;
      
      // Validate input
      if (!email || !password || !name) {
        throw createError('Email, password, and name are required', 400);
      }
      
      // Validate budget if provided
      const budgetAmount = initial_budget || 10000; // Default to ₹10,000
      if (budgetAmount < 1000 || budgetAmount > 10000000) {
        throw createError('Budget must be between ₹1,000 and ₹1,00,00,000', 400);
      }
      
      // Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (authError) {
        throw createError(authError.message, 400);
      }
      
      // Create user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          phone,
          school,
          age
        })
        .select()
        .single();
      
      if (userError) {
        // Rollback auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw createError('Failed to create user profile', 500);
      }
      
      // Create default portfolio with custom budget
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
      
      // Create user settings
      await supabase.from('user_settings').insert({
        user_id: user.id
      });
      
      // Create user profile
      await supabase.from('user_profiles').insert({
        user_id: user.id
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: '7d' }
      );
      
      logger.info(`New user registered: ${email}`);
      
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
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
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: '7d' }
      );
      
      logger.info(`User logged in: ${email}`);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
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

