import apiClient from './client';
import type {
  PortfolioResponse,
  HoldingsResponse,
  TradeHistoryResponse,
  PerformanceResponse,
  BuyStockRequest,
  SellStockRequest,
  BuyStockResponse,
  SellStockResponse,
  UpdateBudgetRequest,
  UpdateBudgetResponse,
  BudgetHistoryResponse,
} from '../types/api';

export const portfolioApi = {
  /**
   * Get user's complete portfolio
   */
  getPortfolio: async (): Promise<PortfolioResponse> => {
    const response = await apiClient.get<PortfolioResponse>('/api/portfolio');
    return response.data;
  },

  /**
   * Get user's holdings
   */
  getHoldings: async (): Promise<HoldingsResponse> => {
    const response = await apiClient.get<HoldingsResponse>('/api/portfolio/holdings');
    return response.data;
  },

  /**
   * Get trade history
   */
  getTradeHistory: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<TradeHistoryResponse> => {
    const response = await apiClient.get<TradeHistoryResponse>('/api/portfolio/trades', {
      params,
    });
    return response.data;
  },

  /**
   * Get portfolio performance metrics
   */
  getPerformance: async (): Promise<PerformanceResponse> => {
    const response = await apiClient.get<PerformanceResponse>('/api/portfolio/performance');
    return response.data;
  },

  /**
   * Buy stock
   */
  buyStock: async (data: BuyStockRequest): Promise<BuyStockResponse> => {
    const response = await apiClient.post<BuyStockResponse>('/api/portfolio/buy', data);
    return response.data;
  },

  /**
   * Sell stock
   */
  sellStock: async (data: SellStockRequest): Promise<SellStockResponse> => {
    const response = await apiClient.post<SellStockResponse>('/api/portfolio/sell', data);
    return response.data;
  },

  /**
   * Update portfolio budget
   */
  updateBudget: async (data: UpdateBudgetRequest): Promise<UpdateBudgetResponse> => {
    const response = await apiClient.put<UpdateBudgetResponse>('/api/portfolio/budget', data);
    return response.data;
  },

  /**
   * Get budget change history
   */
  getBudgetHistory: async (): Promise<BudgetHistoryResponse> => {
    const response = await apiClient.get<BudgetHistoryResponse>('/api/portfolio/budget/history');
    return response.data;
  },
};

