// API Response Types

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  school?: string;
  age?: number;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  school?: string;
  age?: number;
  initial_budget?: number;
}

// Portfolio Types
export interface Portfolio {
  id: string;
  user_id: string;
  budget_amount: number;
  current_cash: number;
  total_value: number;
  total_invested: number;
  holdings_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  holdings_count: number;
  custom_budget_enabled?: boolean;
  budget_set_by?: string;
  budget_set_at?: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  stock_name?: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  invested_value: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  last_updated: string;
}

export interface Trade {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  executed_at: string;
  stocks?: {
    symbol: string;
    company_name: string;
  };
}

export interface PortfolioResponse {
  portfolio: Portfolio;
  holdings: Holding[];
}

export interface HoldingsResponse {
  holdings: Holding[];
  total_invested: number;
  current_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
}

export interface TradeHistoryResponse {
  trades: Trade[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface PerformanceResponse {
  portfolio_value: number;
  initial_budget: number;
  current_cash: number;
  holdings_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  total_invested: number;
  total_returns: number;
  realized_gains: number;
  unrealized_gains: number;
  number_of_trades: number;
  number_of_holdings: number;
}

export interface BuyStockRequest {
  symbol: string;
  quantity: number;
}

export interface SellStockRequest {
  symbol: string;
  quantity: number;
}

export interface BuyStockResponse {
  message: string;
  trade: {
    id: string;
    symbol: string;
    company_name: string;
    quantity: number;
    price: number;
    total_cost: number;
    trade_date: string;
  };
  portfolio: {
    current_cash: number;
    cash_spent: number;
  };
}

export interface SellStockResponse {
  message: string;
  trade: {
    id: string;
    symbol: string;
    company_name: string;
    quantity: number;
    price: number;
    total_revenue: number;
    cost_basis: number;
    profit_loss: number;
    profit_loss_percent: number;
    trade_date: string;
  };
  portfolio: {
    current_cash: number;
    cash_received: number;
  };
}

export interface UpdateBudgetRequest {
  new_budget: number;
  reason?: string;
}

export interface UpdateBudgetResponse {
  message: string;
  old_budget: number;
  new_budget: number;
  new_cash: number;
  current_investments: number;
}

export interface BudgetChange {
  id: string;
  portfolio_id: string;
  old_budget: number;
  new_budget: number;
  changed_by: string;
  change_reason: string;
  changed_at: string;
}

export interface BudgetHistoryResponse {
  history: BudgetChange[];
  current_budget: number;
  custom_budget_enabled: boolean;
}

// Market Data Types
export interface Stock {
  symbol: string;
  company_name: string;
  sector?: string;
  isin?: string;
  listing_date?: string;
  market_cap?: number;
  is_featured?: boolean;
  ltp?: number;
  change_percent?: number;
  volume?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export interface StockDetailResponse {
  symbol: string;
  company_name: string;
  sector?: string;
  isin?: string;
  listing_date?: string;
  market_cap?: number;
  is_featured?: boolean;
  ltp?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change_percent?: number;
  volume?: number;
  pe_ratio?: number;
  beta?: number;
  dividend_yield?: number;
  '52_week_high'?: number;
  '52_week_low'?: number;
}

export interface StocksResponse {
  data: Stock[];
  count: number;
  page?: number;
  limit?: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  data: HistoricalDataPoint[];
}

export interface Sector {
  sector: string;
  stock_count: number;
}

export interface SectorsResponse {
  sectors: Sector[];
}

// Error Response
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

