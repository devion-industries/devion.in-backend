import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  portfolioApi,
  type BuyStockRequest,
  type SellStockRequest,
  type UpdateBudgetRequest,
} from '@/lib/api';
import { toast } from 'sonner';

export const usePortfolio = () => {
  const queryClient = useQueryClient();

  // Get complete portfolio
  const {
    data: portfolioData,
    isLoading: isLoadingPortfolio,
    error: portfolioError,
    refetch: refetchPortfolio,
  } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getPortfolio,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Get holdings
  const {
    data: holdingsData,
    isLoading: isLoadingHoldings,
    refetch: refetchHoldings,
  } = useQuery({
    queryKey: ['holdings'],
    queryFn: portfolioApi.getHoldings,
    staleTime: 30 * 1000,
  });

  // Get trade history
  const {
    data: tradesData,
    isLoading: isLoadingTrades,
    refetch: refetchTrades,
  } = useQuery({
    queryKey: ['trades'],
    queryFn: () => portfolioApi.getTradeHistory({ limit: 50, offset: 0 }),
    staleTime: 60 * 1000,
  });

  // Get performance
  const {
    data: performanceData,
    isLoading: isLoadingPerformance,
    refetch: refetchPerformance,
  } = useQuery({
    queryKey: ['performance'],
    queryFn: portfolioApi.getPerformance,
    staleTime: 60 * 1000,
  });

  // Get budget history
  const {
    data: budgetHistoryData,
    isLoading: isLoadingBudgetHistory,
    refetch: refetchBudgetHistory,
  } = useQuery({
    queryKey: ['budgetHistory'],
    queryFn: portfolioApi.getBudgetHistory,
    staleTime: 5 * 60 * 1000,
  });

  // Buy stock mutation
  const buyStockMutation = useMutation({
    mutationFn: portfolioApi.buyStock,
    onSuccess: (data) => {
      // Invalidate and refetch portfolio data
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['performance'] });

      toast.success(`Bought ${data.trade.quantity} shares of ${data.trade.symbol}`, {
        description: `Total cost: ₹${data.trade.total_cost.toLocaleString()}`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to buy stock', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Sell stock mutation
  const sellStockMutation = useMutation({
    mutationFn: portfolioApi.sellStock,
    onSuccess: (data) => {
      // Invalidate and refetch portfolio data
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['performance'] });

      const profitLoss = data.trade.profit_loss;
      const isProfit = profitLoss >= 0;

      toast.success(`Sold ${data.trade.quantity} shares of ${data.trade.symbol}`, {
        description: `${isProfit ? 'Profit' : 'Loss'}: ₹${Math.abs(profitLoss).toLocaleString()} (${data.trade.profit_loss_percent.toFixed(2)}%)`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to sell stock', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: portfolioApi.updateBudget,
    onSuccess: (data) => {
      // Invalidate portfolio and budget history
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['budgetHistory'] });

      toast.success('Budget updated successfully', {
        description: `New budget: ₹${data.new_budget.toLocaleString()}`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update budget', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Buy stock function
  const buyStock = async (data: BuyStockRequest) => {
    return buyStockMutation.mutateAsync(data);
  };

  // Sell stock function
  const sellStock = async (data: SellStockRequest) => {
    return sellStockMutation.mutateAsync(data);
  };

  // Update budget function
  const updateBudget = async (data: UpdateBudgetRequest) => {
    return updateBudgetMutation.mutateAsync(data);
  };

  return {
    // Data
    portfolio: portfolioData?.portfolio,
    holdings: holdingsData?.holdings || [],
    trades: tradesData?.trades || [],
    performance: performanceData,
    budgetHistory: budgetHistoryData?.history || [],
    
    // Loading states
    isLoadingPortfolio,
    isLoadingHoldings,
    isLoadingTrades,
    isLoadingPerformance,
    isLoadingBudgetHistory,
    
    // Error states
    portfolioError,
    
    // Mutations
    buyStock,
    sellStock,
    updateBudget,
    isBuying: buyStockMutation.isPending,
    isSelling: sellStockMutation.isPending,
    isUpdatingBudget: updateBudgetMutation.isPending,
    
    // Refetch functions
    refetchPortfolio,
    refetchHoldings,
    refetchTrades,
    refetchPerformance,
    refetchBudgetHistory,
  };
};

