import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase client for public operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Create Supabase admin client for privileged operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database helper functions
export const db = {
  // Users
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Portfolios
  async getPortfolio(userId: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async getHoldings(portfolioId: string) {
    const { data, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gt('quantity', 0);
    
    if (error) throw error;
    return data;
  },
  
  // Stocks
  async getStock(symbol: string) {
    const { data, error } = await supabase
      .from('stocks')
      .select('*, stock_metadata(*)')
      .eq('symbol', symbol)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async getFeaturedStocks(limit: number = 500) {
    const { data, error } = await supabase
      .from('stocks')
      .select('*, stock_metadata(*)')
      .eq('is_featured', true)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  async searchStocks(query: string, limit: number = 20) {
    const { data, error} = await supabase
      .from('stocks')
      .select('*, stock_metadata(*)')
      .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // Subscriptions
  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (error) {
      // Return free plan if no subscription
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'free')
        .single();
      
      return {
        user_id: userId,
        plan_id: freePlan?.id,
        status: 'active',
        subscription_plans: freePlan
      };
    }
    
    return data;
  }
};

