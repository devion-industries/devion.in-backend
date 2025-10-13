import { Request, Response, NextFunction } from 'express';
import { db, supabase } from '../config/database';
import { yahooService } from '../services/yahoo.service';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// NIFTY 50 stocks list
const NIFTY_50_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
  'LT', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'TITAN', 'SUNPHARMA', 'ULTRACEMCO', 'BAJFINANCE', 'NESTLEIND', 'HCLTECH',
  'WIPRO', 'ONGC', 'NTPC', 'TATAMOTORS', 'TATASTEEL', 'POWERGRID', 'M&M', 'ADANIENT', 'JSWSTEEL', 'INDUSINDBK',
  'COALINDIA', 'GRASIM', 'TECHM', 'BAJAJFINSV', 'EICHERMOT', 'HINDALCO', 'BRITANNIA', 'DRREDDY', 'ADANIPORTS', 'CIPLA',
  'APOLLOHOSP', 'DIVISLAB', 'TATACONSUM', 'HEROMOTOCO', 'BPCL', 'UPL', 'SBILIFE', 'HDFCLIFE', 'LTIM', 'BAJAJ-AUTO'
];

class MarketController {
  /**
   * Get NIFTY 50 stocks with live prices (default view)
   */
  async getTopStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      // Get NIFTY 50 stocks from Supabase
      const { data: stocks, error } = await supabase
        .from('stocks')
        .select('*')
        .in('symbol', NIFTY_50_SYMBOLS.slice(0, limit));

      if (error) throw createError('Failed to fetch stocks', 500);

      // Get live prices for these stocks
      const symbols = stocks.map((s: any) => s.symbol);
      
      try {
        const quotes = await yahooService.getQuote(symbols);
        
        // Merge quote data with stock info
        const stocksWithPrices = stocks.map((stock: any) => {
          const quote = quotes[`NSE:${stock.symbol}`];
          
          if (quote) {
            return {
              ...stock,
              ltp: quote.last_price,
              change_percent: ((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100,
              volume: quote.volume
            };
          }
          
          return stock;
        });

        res.json({
          data: stocksWithPrices,
          count: stocks.length
        });
      } catch (quoteError) {
        logger.warn('Failed to fetch live prices, returning stock data without prices');
        res.json({
          data: stocks,
          count: stocks.length
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all NSE stocks with pagination
   */
  async getAllStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const { data: stocks, error, count } = await supabase
        .from('stocks')
        .select('*, stock_metadata(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('symbol');

      if (error) throw createError('Failed to fetch stocks', 500);

      res.json({
        data: stocks,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured stocks (top 500)
   */
  async getFeaturedStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 500;

      const stocks = await db.getFeaturedStocks(limit);

      // Get current prices for featured stocks
      const symbols = stocks.map((s: any) => s.symbol).slice(0, 100); // Limit to 100 for API rate limiting
      
      try {
        const quotes = await yahooService.getQuote(symbols);
        
        // Merge quote data with stock info
        const stocksWithPrices = stocks.map((stock: any) => {
          const quote = quotes[`NSE:${stock.symbol}`];
          
          if (quote) {
            return {
              ...stock,
              ltp: quote.last_price,
              change_percent: ((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100,
              volume: quote.volume
            };
          }
          
          return stock;
        });

        res.json({
          data: stocksWithPrices,
          count: stocks.length
        });
      } catch (quoteError) {
        // Return stocks without live prices if Kite API fails
        logger.warn('Failed to fetch live prices, returning stock data without prices');
        res.json({
          data: stocks,
          count: stocks.length
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search stocks by symbol or company name (searches all 2000 stocks)
   */
  async searchStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        throw createError('Search query must be at least 2 characters', 400);
      }

      const limit = parseInt(req.query.limit as string) || 50;

      // Search all stocks in Supabase
      const { data: stocks, error } = await supabase
        .from('stocks')
        .select('*')
        .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw createError('Failed to search stocks', 500);

      // Get live prices for search results
      if (stocks && stocks.length > 0) {
        const symbols = stocks.map((s: any) => s.symbol);
        
        try {
          const quotes = await yahooService.getQuote(symbols);
          
          // Merge quote data with stock info
          const stocksWithPrices = stocks.map((stock: any) => {
            const quote = quotes[`NSE:${stock.symbol}`];
            
            if (quote) {
              return {
                ...stock,
                ltp: quote.last_price,
                change_percent: ((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100,
                volume: quote.volume
              };
            }
            
            return stock;
          });

          res.json({
            data: stocksWithPrices,
            count: stocks.length
          });
        } catch (quoteError) {
          logger.warn('Failed to fetch live prices for search results');
          res.json({
            data: stocks,
            count: stocks.length
          });
        }
      } else {
        res.json({
          data: [],
          count: 0
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get stock details with current price
   */
  async getStockDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol } = req.params;

      const stock = await db.getStock(symbol.toUpperCase());

      if (!stock) {
        throw createError('Stock not found', 404);
      }

      // Get current price from Yahoo Finance
      try {
        const quotes = await yahooService.getQuote(symbol);
        const quote = quotes[`NSE:${symbol.toUpperCase()}`];

        if (quote) {
          stock.ltp = quote.last_price;
          stock.ohlc = quote.ohlc;
          stock.change_percent = ((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100;
          stock.volume = quote.volume;
        }
      } catch (quoteError) {
        logger.warn(`Failed to fetch live price for ${symbol}`);
      }

      res.json({
        data: stock
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalData(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol } = req.params;
      const interval = req.query.interval as string || 'day';
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const data = await yahooService.getHistoricalData(
        symbol.toUpperCase(),
        interval,
        from,
        to
      );

      res.json({
        data,
        symbol: symbol.toUpperCase(),
        interval,
        from,
        to
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all sectors with performance
   */
  async getSectors(req: Request, res: Response, next: NextFunction) {
    try {
      const { data: sectors, error } = await supabase
        .from('stocks')
        .select('sector')
        .not('sector', 'is', null);

      if (error) throw createError('Failed to fetch sectors', 500);

      // Get unique sectors
      const uniqueSectors = [...new Set(sectors.map((s: any) => s.sector))];

      res.json({
        data: uniqueSectors,
        count: uniqueSectors.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sync stock data from curated list (admin only)
   */
  async syncStockData(req: Request, res: Response, next: NextFunction) {
    try {
      await yahooService.syncStocks();

      res.json({
        message: 'Stock data sync completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const marketController = new MarketController();

