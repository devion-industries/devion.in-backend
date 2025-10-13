import { useQuery } from '@tanstack/react-query';
import { marketApi } from '@/lib/api';

export const useMarket = () => {
  // Get featured stocks
  const {
    data: featuredStocks,
    isLoading: isLoadingFeatured,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ['featuredStocks'],
    queryFn: marketApi.getFeaturedStocks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute during market hours
  });

  // Get sectors
  const {
    data: sectorsData,
    isLoading: isLoadingSectors,
  } = useQuery({
    queryKey: ['sectors'],
    queryFn: marketApi.getSectors,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    featuredStocks: featuredStocks?.data || [],
    sectors: sectorsData?.sectors || [],
    isLoadingFeatured,
    isLoadingSectors,
    refetchFeatured,
  };
};

/**
 * Hook to search stocks
 */
export const useStockSearch = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['stockSearch', query],
    queryFn: () => marketApi.searchStocks(query),
    enabled: enabled && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get stock details
 */
export const useStockDetails = (symbol: string, enabled = true) => {
  return useQuery({
    queryKey: ['stockDetails', symbol],
    queryFn: () => marketApi.getStockDetails(symbol),
    enabled: enabled && !!symbol,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to get historical data
 */
export const useHistoricalData = (
  symbol: string,
  interval: '1d' | '1wk' | '1mo' = '1d',
  period: '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo',
  enabled = true
) => {
  return useQuery({
    queryKey: ['historicalData', symbol, interval, period],
    queryFn: () => marketApi.getHistoricalData(symbol, { interval, period }),
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get paginated stocks
 */
export const useStocks = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
}) => {
  return useQuery({
    queryKey: ['stocks', params],
    queryFn: () => marketApi.getStocks(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

