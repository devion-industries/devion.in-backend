import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db, supabaseAdmin as supabase } from '../config/database';
import { yahooService } from '../services/yahoo.service';
import { PortfolioHistoryService } from '../services/portfolioHistory.service';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

class PortfolioController {
  /**
   * Helper function to calculate total portfolio value
   * Returns: cash + current value of all holdings
   */
  private async calculateTotalPortfolioValue(portfolioId: string, currentCash: number): Promise<number> {
    try {
      // Get all holdings
      const { data: holdings } = await supabase
        .from('holdings')
        .select('symbol, quantity, avg_buy_price')
        .eq('portfolio_id', portfolioId)
        .gt('quantity', 0);

      if (!holdings || holdings.length === 0) {
        return currentCash; // Only cash, no holdings
      }

      // Get current prices for all holdings
      const symbols = holdings.map(h => h.symbol);
      const quotes = await yahooService.getQuote(symbols);

      // Calculate total holdings value with current prices
      let holdingsValue = 0;
      holdings.forEach(holding => {
        const quote = quotes[`NSE:${holding.symbol}`];
        const currentPrice = quote?.last_price || holding.avg_buy_price; // Fallback to avg price if quote unavailable
        holdingsValue += currentPrice * holding.quantity;
      });

      return currentCash + holdingsValue;
    } catch (error) {
      logger.error('Error calculating portfolio value:', error);
      // Return cash only if calculation fails
      return currentCash;
    }
  }

  /**
   * Get user's portfolio summary
   */
  async getPortfolio(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      console.log(`\n📊 [PORTFOLIO] Fetching portfolio for user: ${userId}`);
      
      // Get portfolio
      const portfolio = await db.getPortfolio(userId);
      
      console.log(`📊 [PORTFOLIO] Query result:`, portfolio ? 'Found' : 'Not found');
      
      if (!portfolio) {
        console.error(`❌ [PORTFOLIO] No portfolio found for user ${userId}`);
        
        // Try to create portfolio if it doesn't exist
        console.log(`🔧 [PORTFOLIO] Attempting to create portfolio...`);
        const { data: newPortfolio, error: insertError } = await supabase
          .from('portfolios')
          .insert({
            user_id: userId,
            budget_amount: 100000,
            current_cash: 100000,
            total_value: 100000,
            custom_budget_enabled: true,
            budget_set_by: userId
          })
          .select()
          .single();
        
        if (insertError || !newPortfolio) {
          console.error(`❌ [PORTFOLIO] Failed to create portfolio:`, insertError);
          throw createError('Portfolio not found and could not be created', 404);
        }
        
        console.log(`✅ [PORTFOLIO] Created new portfolio with ₹1,00,000`);
        
        // Return newly created portfolio
        return res.json({
          portfolio: {
            id: newPortfolio.id,
            user_id: newPortfolio.user_id,
            budget_amount: 100000,
            current_cash: 100000,
            total_value: 100000,
            total_invested: 0,
            holdings_value: 0,
            total_gain_loss: 0,
            total_gain_loss_percent: 0,
            holdings_count: 0
          },
          holdings: []
        });
      }
      
      console.log(`✅ [PORTFOLIO] Found portfolio:`, {
        id: portfolio.id,
        cash: portfolio.current_cash,
        budget: portfolio.budget_amount
      });
      
      // Get holdings
      const { data: holdings } = await supabase
        .from('holdings')
        .select('*, stocks(*)')
        .eq('portfolio_id', portfolio.id)
        .gt('quantity', 0);
      
      // Calculate current portfolio value
      let totalValue = portfolio.current_cash;
      let totalInvested = 0;
      let currentHoldingsValue = 0;
      
      if (holdings && holdings.length > 0) {
        // Get current prices for all holdings
        const symbols = holdings.map(h => h.stocks.symbol);
        const quotes = await yahooService.getQuote(symbols);
        
        // Calculate values
        const holdingsWithPrices = holdings.map(holding => {
          const quote = quotes[`NSE:${holding.stocks.symbol}`];
          const currentPrice = quote?.last_price || holding.average_price;
          const currentValue = currentPrice * holding.quantity;
          const invested = holding.average_price * holding.quantity;
          const gain = currentValue - invested;
          const gainPercent = (gain / invested) * 100;
          
          totalInvested += invested;
          currentHoldingsValue += currentValue;
          
          return {
            ...holding,
            symbol: holding.stocks.symbol,
            stock_name: holding.stocks.company_name,
            sector: holding.stocks.sector || 'Other',
            current_price: currentPrice,
            current_value: currentValue,
            invested_value: invested,
            gain_loss: gain,
            gain_loss_percent: gainPercent
          };
        });
        
        totalValue = portfolio.current_cash + currentHoldingsValue;
        
        res.json({
          portfolio: {
            id: portfolio.id,
            user_id: portfolio.user_id,
            budget_amount: portfolio.budget_amount,
            current_cash: portfolio.current_cash,
            total_value: totalValue,
            total_invested: totalInvested,
            holdings_value: currentHoldingsValue,
            total_gain_loss: totalValue - portfolio.budget_amount,
            total_gain_loss_percent: ((totalValue - portfolio.budget_amount) / portfolio.budget_amount) * 100,
            holdings_count: holdings.length
          },
          holdings: holdingsWithPrices
        });
      } else {
        res.json({
          portfolio: {
            id: portfolio.id,
            user_id: portfolio.user_id,
            budget_amount: portfolio.budget_amount,
            current_cash: portfolio.current_cash,
            total_value: totalValue,
            total_invested: 0,
            holdings_value: 0,
            total_gain_loss: 0,
            total_gain_loss_percent: 0,
            holdings_count: 0
          },
          holdings: []
        });
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Buy stock
   */
  async buyStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { symbol, quantity } = req.body;
      
      // Validate input
      if (!symbol || !quantity || quantity <= 0) {
        throw createError('Symbol and valid quantity are required', 400);
      }
      
      // Get portfolio
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      // Get stock details
      const stock = await db.getStock(symbol.toUpperCase());
      
      if (!stock) {
        throw createError('Stock not found', 404);
      }
      
      // Get current price from Yahoo Finance
      const quotes = await yahooService.getQuote(symbol.toUpperCase());
      const quote = quotes[`NSE:${symbol.toUpperCase()}`];
      
      if (!quote || !quote.last_price) {
        throw createError('Unable to fetch current stock price', 503);
      }
      
      const currentPrice = quote.last_price;
      const totalCost = currentPrice * quantity;
      
      // Check if user has enough cash
      if (portfolio.current_cash < totalCost) {
        throw createError(
          `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${portfolio.current_cash.toFixed(2)}`,
          400
        );
      }
      
      // Execute trade with rollback on failure
      const tradeDate = new Date().toISOString();
      let createdTrade: any = null;
      let createdOrUpdatedHolding = false;
      let updatedPortfolio = false;
      
      try {
        // Step 1: Create trade record
        const { data: trade, error: tradeError } = await supabase
          .from('trades')
          .insert({
            user_id: userId,
            portfolio_id: portfolio.id,
            symbol: stock.symbol,
            type: 'BUY',
            quantity: quantity,
            price: currentPrice,
            total_amount: totalCost,
            executed_at: tradeDate
          })
          .select()
          .single();
        
        if (tradeError) {
          logger.error('Buy trade creation error:', tradeError);
          throw new Error(`Failed to create trade record: ${tradeError.message || tradeError.code}`);
        }
        
        createdTrade = trade;
        
        // Step 2: Update or create holding
        const { data: existingHolding } = await supabase
          .from('holdings')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .eq('symbol', stock.symbol)
          .maybeSingle();
        
        if (existingHolding) {
          // Update existing holding
          const newTotalQuantity = existingHolding.quantity + quantity;
          const newTotalValue = (existingHolding.avg_buy_price * existingHolding.quantity) + totalCost;
          const newAveragePrice = newTotalValue / newTotalQuantity;
          
          const { error: updateError } = await supabase
            .from('holdings')
            .update({
              quantity: newTotalQuantity,
              avg_buy_price: newAveragePrice,
              current_value: newAveragePrice * newTotalQuantity,
              last_updated: tradeDate
            })
            .eq('id', existingHolding.id);
          
          if (updateError) {
            throw new Error(`Failed to update holding: ${updateError.message}`);
          }
        } else {
          // Create new holding
          const { error: holdingError } = await supabase
            .from('holdings')
            .insert({
              portfolio_id: portfolio.id,
              symbol: stock.symbol,
              quantity: quantity,
              avg_buy_price: currentPrice,
              current_value: totalCost,
              unrealized_pnl: 0,
              last_updated: tradeDate
            });
          
          if (holdingError) {
            throw new Error(`Failed to create holding: ${holdingError.message}`);
          }
        }
        
        createdOrUpdatedHolding = true;
        
        // Step 3: Update portfolio cash and total value
        const newCash = portfolio.current_cash - totalCost;
        const totalValue = await this.calculateTotalPortfolioValue(portfolio.id, newCash);
        
        const { error: portfolioError } = await supabase
          .from('portfolios')
          .update({
            current_cash: newCash,
            total_value: totalValue,
            updated_at: tradeDate
          })
          .eq('id', portfolio.id);
        
        if (portfolioError) {
          throw new Error(`Failed to update portfolio: ${portfolioError.message}`);
        }
        
        updatedPortfolio = true;
        
        logger.info(`✅ User ${userId} bought ${quantity} shares of ${symbol} at ₹${currentPrice}`);
        
        // Take snapshot asynchronously (don't wait for it, don't block response)
        PortfolioHistoryService.takeSnapshot(userId).catch(error => {
          logger.error('Failed to take snapshot after buy:', error);
        });
        
        res.json({
          message: 'Stock purchased successfully',
          trade: {
            id: createdTrade.id,
            symbol: stock.symbol,
            company_name: stock.company_name,
            quantity: quantity,
            price: currentPrice,
            total_cost: totalCost,
            trade_date: tradeDate
          },
          portfolio: {
            current_cash: newCash,
            cash_spent: totalCost
          }
        });
        
      } catch (rollbackError: any) {
        // Rollback on any failure
        logger.error('❌ Trade execution failed, rolling back:', rollbackError);
        
        // Rollback portfolio update
        if (updatedPortfolio) {
          await supabase
            .from('portfolios')
            .update({
              current_cash: portfolio.current_cash,
              total_value: portfolio.total_value
            })
            .eq('id', portfolio.id);
          logger.info('↩️  Rolled back portfolio update');
        }
        
        // Rollback holding (restore previous or delete new)
        if (createdOrUpdatedHolding) {
          const { data: currentHolding } = await supabase
            .from('holdings')
            .select('*')
            .eq('portfolio_id', portfolio.id)
            .eq('symbol', stock.symbol)
            .maybeSingle();
          
          if (currentHolding) {
            // Check if this was a new holding or updated one
            if (currentHolding.quantity === quantity) {
              // Was newly created, delete it
              await supabase
                .from('holdings')
                .delete()
                .eq('id', currentHolding.id);
              logger.info('↩️  Rolled back holding creation');
            } else {
              // Was updated, restore previous values
              const originalQuantity = currentHolding.quantity - quantity;
              const originalValue = (currentHolding.avg_buy_price * currentHolding.quantity) - totalCost;
              const originalAvgPrice = originalValue / originalQuantity;
              
              await supabase
                .from('holdings')
                .update({
                  quantity: originalQuantity,
                  avg_buy_price: originalAvgPrice,
                  current_value: originalValue
                })
                .eq('id', currentHolding.id);
              logger.info('↩️  Rolled back holding update');
            }
          }
        }
        
        // Rollback trade creation
        if (createdTrade) {
          await supabase
            .from('trades')
            .delete()
            .eq('id', createdTrade.id);
          logger.info('↩️  Rolled back trade creation');
        }
        
        throw createError(`Trade failed: ${rollbackError.message}`, 500);
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Sell stock
   */
  async sellStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { symbol, quantity } = req.body;
      
      // Validate input
      if (!symbol || !quantity || quantity <= 0) {
        throw createError('Symbol and valid quantity are required', 400);
      }
      
      // Get portfolio
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      // Get stock details
      const stock = await db.getStock(symbol.toUpperCase());
      
      if (!stock) {
        throw createError('Stock not found', 404);
      }
      
      // Check if user has this holding
      const { data: holding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .eq('symbol', stock.symbol)
        .maybeSingle();
      
      if (!holding || holding.quantity < quantity) {
        throw createError(
          `Insufficient shares. You own ${holding?.quantity || 0} shares, cannot sell ${quantity}`,
          400
        );
      }
      
      // Get current price from Yahoo Finance
      const quotes = await yahooService.getQuote(symbol.toUpperCase());
      const quote = quotes[`NSE:${symbol.toUpperCase()}`];
      
      if (!quote || !quote.last_price) {
        throw createError('Unable to fetch current stock price', 503);
      }
      
      const currentPrice = quote.last_price;
      const totalRevenue = currentPrice * quantity;
      
      // Calculate profit/loss
      const costBasis = holding.avg_buy_price * quantity;
      const profitLoss = totalRevenue - costBasis;
      const profitLossPercent = (profitLoss / costBasis) * 100;
      
      // Execute trade
      const tradeDate = new Date().toISOString();
      
      // Create trade record
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: userId,
          portfolio_id: portfolio.id,
          symbol: stock.symbol,
          type: 'SELL',
          quantity: quantity,
          price: currentPrice,
          total_amount: totalRevenue,
          executed_at: tradeDate
        })
        .select()
        .single();
      
      if (tradeError) {
        throw createError('Failed to create trade record', 500);
      }
      
      // Update holding
      const newQuantity = holding.quantity - quantity;
      
      if (newQuantity === 0) {
        // Remove holding if all shares sold
        await supabase
          .from('holdings')
          .delete()
          .eq('id', holding.id);
      } else {
        // Update holding quantity
        const newCurrentValue = holding.avg_buy_price * newQuantity;
        await supabase
          .from('holdings')
          .update({
            quantity: newQuantity,
            current_value: newCurrentValue,
            last_updated: tradeDate
          })
          .eq('id', holding.id);
      }
      
      // Update portfolio cash and calculate correct total value
      const newCash = portfolio.current_cash + totalRevenue;
      const totalValue = await this.calculateTotalPortfolioValue(portfolio.id, newCash);
      
      await supabase
        .from('portfolios')
        .update({
          current_cash: newCash,
          total_value: totalValue, // Correctly calculated: cash + all holdings
          updated_at: tradeDate
        })
        .eq('id', portfolio.id);
      
      logger.info(`User ${userId} sold ${quantity} shares of ${symbol} at ₹${currentPrice}`);
      
      // Take snapshot asynchronously (don't wait for it, don't block response)
      PortfolioHistoryService.takeSnapshot(userId).catch(error => {
        logger.error('Failed to take snapshot after sell:', error);
      });
      
      res.json({
        message: 'Stock sold successfully',
        trade: {
          id: trade.id,
          symbol: stock.symbol,
          company_name: stock.company_name,
          quantity: quantity,
          price: currentPrice,
          total_revenue: totalRevenue,
          cost_basis: costBasis,
          profit_loss: profitLoss,
          profit_loss_percent: profitLossPercent,
          trade_date: tradeDate
        },
        portfolio: {
          current_cash: newCash,
          cash_received: totalRevenue
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get holdings
   */
  async getHoldings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      const holdings = await db.getHoldings(portfolio.id);
      
      if (!holdings || holdings.length === 0) {
        return res.json({
          holdings: [],
          total_invested: 0,
          current_value: 0,
          total_gain_loss: 0
        });
      }
      
      // Get current prices and stock details
      const symbols = holdings.map(h => h.symbol);
      const quotes = await yahooService.getQuote(symbols);
      
      // Get stock details for each holding
      const stockDetails = await Promise.all(
        symbols.map(symbol => db.getStock(symbol))
      );
      
      let totalInvested = 0;
      let currentValue = 0;
      
      const holdingsWithPrices = holdings.map((holding, index) => {
        const quote = quotes[`NSE:${holding.symbol}`];
        const stock = stockDetails[index];
        const currentPrice = quote?.last_price || holding.avg_buy_price;
        const invested = holding.avg_buy_price * holding.quantity;
        const value = currentPrice * holding.quantity;
        const gain = value - invested;
        const gainPercent = (gain / invested) * 100;
        
        totalInvested += invested;
        currentValue += value;
        
        return {
          ...holding,
          stock_name: stock?.company_name || holding.symbol,
          sector: stock?.sector || 'Other',
          current_price: currentPrice,
          invested_value: invested,
          current_value: value,
          gain_loss: gain,
          gain_loss_percent: gainPercent
        };
      });
      
      res.json({
        holdings: holdingsWithPrices,
        total_invested: totalInvested,
        current_value: currentValue,
        total_gain_loss: currentValue - totalInvested,
        total_gain_loss_percent: ((currentValue - totalInvested) / totalInvested) * 100
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get trade history
   */
  async getTradeHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      const { data: trades, error, count } = await supabase
        .from('trades')
        .select('*, stocks(symbol, company_name)', { count: 'exact' })
        .eq('portfolio_id', portfolio.id)
        .order('executed_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw createError('Failed to fetch trade history', 500);
      }
      
      res.json({
        trades: trades || [],
        pagination: {
          limit,
          offset,
          total: count || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update portfolio budget
   */
  async updateBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { new_budget, reason } = req.body;
      
      // Validate budget
      if (!new_budget || new_budget < 1000 || new_budget > 10000000) {
        throw createError('Budget must be between ₹1,000 and ₹1,00,00,000', 400);
      }
      
      // Get portfolio
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      // Check if budget is controlled by cohort
      if (!portfolio.custom_budget_enabled) {
        throw createError('Budget is managed by your cohort/class. Contact your teacher to modify.', 403);
      }
      
      // Calculate new cash (maintain the same proportion)
      const currentInvestment = portfolio.budget_amount - portfolio.current_cash;
      const newCash = new_budget - currentInvestment;
      
      // Ensure new cash is not negative
      if (newCash < 0) {
        throw createError(
          `Cannot reduce budget below current investments. Current investment: ₹${currentInvestment.toFixed(2)}`,
          400
        );
      }
      
      // Record budget change history
      await supabase.from('budget_change_history').insert({
        portfolio_id: portfolio.id,
        old_budget: portfolio.budget_amount,
        new_budget: new_budget,
        changed_by: userId,
        change_reason: reason || 'User requested budget update'
      });
      
      // Update portfolio
      const { error } = await supabase
        .from('portfolios')
        .update({
          budget_amount: new_budget,
          current_cash: newCash,
          budget_set_by: userId,
          budget_set_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio.id);
      
      if (error) {
        throw createError('Failed to update budget', 500);
      }
      
      logger.info(`User ${userId} updated budget from ₹${portfolio.budget_amount} to ₹${new_budget}`);
      
      res.json({
        message: 'Budget updated successfully',
        old_budget: portfolio.budget_amount,
        new_budget: new_budget,
        new_cash: newCash,
        current_investments: currentInvestment
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get budget change history
   */
  async getBudgetHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      const { data: history, error } = await supabase
        .from('budget_change_history')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .order('changed_at', { ascending: false });
      
      if (error) {
        throw createError('Failed to fetch budget history', 500);
      }
      
      res.json({
        history: history || [],
        current_budget: portfolio.budget_amount,
        custom_budget_enabled: portfolio.custom_budget_enabled
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get portfolio performance
   */
  async getPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const portfolio = await db.getPortfolio(userId);
      
      if (!portfolio) {
        throw createError('Portfolio not found', 404);
      }
      
      // Get all trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .order('executed_at', { ascending: true });
      
      // Get current holdings
      const holdings = await db.getHoldings(portfolio.id);
      
      // Calculate total invested
      let totalBought = 0;
      let totalSold = 0;
      
      trades?.forEach(trade => {
        if (trade.trade_type === 'buy') {
          totalBought += trade.total_amount;
        } else {
          totalSold += trade.total_amount;
        }
      });
      
      // Calculate current holdings value
      let currentHoldingsValue = 0;
      
      if (holdings && holdings.length > 0) {
        const symbols = holdings.map(h => h.symbol);
        const quotes = await yahooService.getQuote(symbols);
        
        holdings.forEach(holding => {
          const quote = quotes[`NSE:${holding.symbol}`];
          const currentPrice = quote?.last_price || holding.avg_buy_price;
          currentHoldingsValue += currentPrice * holding.quantity;
        });
      }
      
      const totalValue = portfolio.current_cash + currentHoldingsValue;
      const totalGainLoss = totalValue - portfolio.budget_amount;
      const totalGainLossPercent = (totalGainLoss / portfolio.budget_amount) * 100;
      
      // Calculate realized gains (from selling)
      const realizedGains = totalSold - (totalBought - (portfolio.current_cash - portfolio.budget_amount + currentHoldingsValue));
      
      // Calculate unrealized gains (current holdings)
      let unrealizedGains = 0;
      if (holdings) {
        holdings.forEach(holding => {
          const invested = holding.average_price * holding.quantity;
          unrealizedGains += (currentHoldingsValue / holdings.length) - invested;
        });
      }
      
      res.json({
        portfolio_value: totalValue,
        initial_budget: portfolio.budget_amount,
        current_cash: portfolio.current_cash,
        holdings_value: currentHoldingsValue,
        total_gain_loss: totalGainLoss,
        total_gain_loss_percent: totalGainLossPercent,
        total_invested: totalBought,
        total_returns: totalSold,
        realized_gains: totalSold > 0 ? totalSold - (trades?.filter(t => t.trade_type === 'sell').reduce((sum, t) => {
          // Calculate cost basis for sold shares
          return sum;
        }, 0) || 0) : 0,
        unrealized_gains: currentHoldingsValue - (totalBought - totalSold),
        number_of_trades: trades?.length || 0,
        number_of_holdings: holdings?.length || 0
      });
    } catch (error) {
      next(error);
    }
  }
}

export const portfolioController = new PortfolioController();

