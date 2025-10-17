import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db, supabaseAdmin as supabase } from '../config/database';
import { yahooService } from '../services/yahoo.service';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Comprehensive debug version of buyStock
export async function buyStockDebug(req: AuthRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log(`🚀 [${requestId}] BUY STOCK REQUEST STARTED`);
    console.log('='.repeat(80));
    
    const userId = req.user!.id;
    const { symbol, quantity } = req.body;
    
    console.log(`📝 [${requestId}] REQUEST DETAILS:`);
    console.log(JSON.stringify({
      userId,
      symbol,
      quantity,
      timestamp: new Date().toISOString(),
      headers: {
        authorization: req.headers.authorization?.substring(0, 20) + '...',
        'content-type': req.headers['content-type']
      }
    }, null, 2));
    
    // Step 1: Validation
    console.log(`\n✅ [${requestId}] STEP 1: INPUT VALIDATION`);
    if (!symbol || !quantity || quantity <= 0) {
      console.error(`❌ [${requestId}] VALIDATION FAILED:`, { symbol, quantity });
      throw createError('Symbol and valid quantity are required', 400);
    }
    console.log(`✅ [${requestId}] Input validation passed`);
    
    // Step 2: Get Portfolio
    console.log(`\n📊 [${requestId}] STEP 2: FETCHING PORTFOLIO`);
    console.log(`   Calling: db.getPortfolio("${userId}")`);
    
    let portfolio;
    try {
      portfolio = await db.getPortfolio(userId);
      console.log(`✅ [${requestId}] Portfolio fetched successfully:`, {
        portfolioId: portfolio?.id,
        currentCash: portfolio?.current_cash,
        budgetAmount: portfolio?.budget_amount
      });
    } catch (error: any) {
      console.error(`❌ [${requestId}] PORTFOLIO FETCH FAILED:`, {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      throw error;
    }
    
    if (!portfolio) {
      console.error(`❌ [${requestId}] Portfolio is null/undefined for user ${userId}`);
      throw createError('Portfolio not found', 404);
    }
    
    // Step 3: Get Stock
    console.log(`\n📈 [${requestId}] STEP 3: FETCHING STOCK DATA`);
    console.log(`   Calling: db.getStock("${symbol.toUpperCase()}")`);
    
    let stock;
    try {
      stock = await db.getStock(symbol.toUpperCase());
      console.log(`✅ [${requestId}] Stock fetched successfully:`, {
        symbol: stock?.symbol,
        companyName: stock?.company_name,
        sector: stock?.sector
      });
    } catch (error: any) {
      console.error(`❌ [${requestId}] STOCK FETCH FAILED:`, {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    if (!stock) {
      console.error(`❌ [${requestId}] Stock not found: ${symbol.toUpperCase()}`);
      throw createError('Stock not found', 404);
    }
    
    // Step 4: Get Price from Yahoo Finance
    console.log(`\n💹 [${requestId}] STEP 4: FETCHING LIVE PRICE`);
    console.log(`   Calling: yahooService.getQuote("${symbol.toUpperCase()}")`);
    
    let quotes, quote;
    try {
      quotes = await yahooService.getQuote(symbol.toUpperCase());
      quote = quotes[`NSE:${symbol.toUpperCase()}`];
      
      console.log(`✅ [${requestId}] Price fetched:`, {
        rawQuotes: JSON.stringify(quotes, null, 2),
        quote: quote,
        lastPrice: quote?.last_price
      });
    } catch (error: any) {
      console.error(`❌ [${requestId}] PRICE FETCH FAILED:`, {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
    
    if (!quote || !quote.last_price) {
      console.error(`❌ [${requestId}] Invalid price data:`, { quote });
      throw createError('Unable to fetch current stock price', 503);
    }
    
    const currentPrice = quote.last_price;
    const totalCost = currentPrice * quantity;
    
    console.log(`💰 [${requestId}] PRICE CALCULATION:`, {
      currentPrice,
      quantity,
      totalCost,
      availableCash: portfolio.current_cash,
      canAfford: portfolio.current_cash >= totalCost
    });
    
    // Step 5: Check funds
    console.log(`\n💵 [${requestId}] STEP 5: CHECKING FUNDS`);
    if (portfolio.current_cash < totalCost) {
      console.error(`❌ [${requestId}] INSUFFICIENT FUNDS:`, {
        required: totalCost,
        available: portfolio.current_cash,
        shortfall: totalCost - portfolio.current_cash
      });
      throw createError(
        `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${portfolio.current_cash.toFixed(2)}`,
        400
      );
    }
    console.log(`✅ [${requestId}] Funds check passed`);
    
    // Step 6: Create Trade
    const tradeDate = new Date().toISOString();
    console.log(`\n📝 [${requestId}] STEP 6: CREATING TRADE RECORD`);
    
    const tradeData = {
      user_id: userId,
      portfolio_id: portfolio.id,
      symbol: stock.symbol,
      type: 'BUY',
      quantity: quantity,
      price: currentPrice,
      total_amount: totalCost,
      executed_at: tradeDate
    };
    
    console.log(`   Insert data:`, JSON.stringify(tradeData, null, 2));
    console.log(`   Using client: supabaseAdmin (service role)`);
    
    let trade, tradeError;
    try {
      const result = await supabase
        .from('trades')
        .insert(tradeData)
        .select()
        .single();
      
      trade = result.data;
      tradeError = result.error;
      
      console.log(`   DB Response:`, {
        data: trade,
        error: tradeError,
        hasData: !!trade,
        hasError: !!tradeError
      });
    } catch (error: any) {
      console.error(`❌ [${requestId}] TRADE INSERT EXCEPTION:`, {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      throw error;
    }
    
    if (tradeError) {
      console.error(`❌ [${requestId}] TRADE CREATION FAILED:`, {
        error: tradeError,
        message: tradeError.message,
        code: tradeError.code,
        details: tradeError.details,
        hint: tradeError.hint
      });
      throw createError(`Failed to create trade: ${JSON.stringify(tradeError)}`, 500);
    }
    
    console.log(`✅ [${requestId}] Trade created successfully:`, {
      tradeId: trade.id,
      symbol: trade.symbol,
      quantity: trade.quantity,
      price: trade.price
    });
    
    // Step 7: Update/Create Holding
    console.log(`\n📦 [${requestId}] STEP 7: MANAGING HOLDING`);
    
    let existingHolding;
    try {
      const { data } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .eq('symbol', stock.symbol)
        .single();
      
      existingHolding = data;
      console.log(`   Existing holding:`, existingHolding || 'None found');
    } catch (error: any) {
      console.log(`   No existing holding found (this is OK for first purchase)`);
    }
    
    if (existingHolding) {
      console.log(`   Updating existing holding...`);
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
        console.error(`❌ [${requestId}] HOLDING UPDATE FAILED:`, updateError);
        throw createError(`Failed to update holding: ${updateError.message}`, 500);
      }
      console.log(`✅ [${requestId}] Holding updated successfully`);
    } else {
      console.log(`   Creating new holding...`);
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
        console.error(`❌ [${requestId}] HOLDING CREATE FAILED:`, holdingError);
        throw createError(`Failed to create holding: ${holdingError.message}`, 500);
      }
      console.log(`✅ [${requestId}] Holding created successfully`);
    }
    
    // Step 8: Update Portfolio Cash
    console.log(`\n💳 [${requestId}] STEP 8: UPDATING PORTFOLIO CASH`);
    const newCash = portfolio.current_cash - totalCost;
    console.log(`   Old cash: ₹${portfolio.current_cash}`);
    console.log(`   Cost: ₹${totalCost}`);
    console.log(`   New cash: ₹${newCash}`);
    
    const { error: portfolioError } = await supabase
      .from('portfolios')
      .update({
        current_cash: newCash,
        total_value: newCash + totalCost,
        updated_at: tradeDate
      })
      .eq('id', portfolio.id);
    
    if (portfolioError) {
      console.error(`❌ [${requestId}] PORTFOLIO UPDATE FAILED:`, portfolioError);
      throw createError(`Failed to update portfolio: ${portfolioError.message}`, 500);
    }
    console.log(`✅ [${requestId}] Portfolio updated successfully`);
    
    // Success!
    const duration = Date.now() - startTime;
    console.log(`\n✅ [${requestId}] ========== SUCCESS ==========`);
    console.log(`   Total duration: ${duration}ms`);
    console.log('='.repeat(80) + '\n');
    
    logger.info(`Trade executed successfully`, {
      requestId,
      userId,
      symbol: stock.symbol,
      quantity,
      price: currentPrice,
      totalCost,
      duration
    });
    
    res.json({
      message: 'Stock purchased successfully',
      trade: {
        id: trade.id,
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
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`\n❌ [${requestId}] ========== FAILURE ==========`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.statusCode || 500}`);
    console.log(`   Duration: ${duration}ms`);
    console.log('='.repeat(80) + '\n');
    
    logger.error(`Trade execution failed`, {
      requestId,
      error: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      duration
    });
    
    next(error);
  }
}

