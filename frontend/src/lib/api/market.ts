import apiClient from './client';
import type {
  Stock,
  StockDetailResponse,
  StocksResponse,
  HistoricalDataResponse,
  SectorsResponse,
} from '../types/api';

export const marketApi = {
  /**
   * Get all stocks with pagination
   */
  getStocks: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sector?: string;
  }): Promise<StocksResponse> => {
    const response = await apiClient.get<StocksResponse>('/api/market/stocks', {
      params,
    });
    return response.data;
  },

  /**
   * Get featured stocks
   */
  getFeaturedStocks: async (): Promise<StocksResponse> => {
    const response = await apiClient.get<StocksResponse>('/api/market/featured');
    return response.data;
  },

  /**
   * Search stocks
   */
  searchStocks: async (query: string): Promise<Stock[]> => {
    const response = await apiClient.get<{ results: Stock[] }>('/api/market/search', {
      params: { q: query },
    });
    return response.data.results;
  },

  /**
   * Get stock details
   */
  getStockDetails: async (symbol: string): Promise<StockDetailResponse> => {
    const response = await apiClient.get<StockDetailResponse>(`/api/market/stocks/${symbol}`);
    return response.data;
  },

  /**
   * Get historical data for a stock
   */
  getHistoricalData: async (
    symbol: string,
    params?: {
      interval?: '1d' | '1wk' | '1mo';
      period?: '1mo' | '3mo' | '6mo' | '1y' | '5y';
    }
  ): Promise<HistoricalDataResponse> => {
    const response = await apiClient.get<HistoricalDataResponse>(
      `/api/market/stocks/${symbol}/historical`,
      { params }
    );
    return response.data;
  },

  /**
   * Get all sectors
   */
  getSectors: async (): Promise<SectorsResponse> => {
    const response = await apiClient.get<SectorsResponse>('/api/market/sectors');
    return response.data;
  },

  /**
   * Sync stock data (Admin only)
   */
  syncStocks: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/market/sync');
    return response.data;
  },
};

