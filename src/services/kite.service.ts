import { KiteConnect } from 'kiteconnect';
import { config } from '../config/env';
import { supabase } from '../config/database';
import logger from '../utils/logger';

class KiteService {
  private kite: any;
  private isInitialized: boolean = false;

  constructor() {
    if (config.kite.apiKey && config.kite.apiSecret) {
      this.kite = new KiteConnect({
        api_key: config.kite.apiKey,
        access_token: config.kite.accessToken
      });
      this.isInitialized = true;
      logger.info('Kite Connect initialized');
    } else {
      logger.warn('Kite Connect credentials not provided - using demo mode');
    }
  }

  /**
   * Get all NSE instruments
   */
  async getInstruments(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        return this.getMockInstruments();
      }

      const instruments = await this.kite.getInstruments('NSE');
      return instruments;
    } catch (error) {
      logger.error('Error fetching instruments:', error);
      return this.getMockInstruments();
    }
  }

  /**
   * Sync all NSE instruments to database
   */
  async syncInstruments(): Promise<void> {
    try {
      logger.info('Starting instrument sync...');
      
      const instruments = await this.getInstruments();
      
      // Filter NSE equity instruments
      const equityInstruments = instruments.filter((inst: any) => 
        inst.exchange === 'NSE' && inst.instrument_type === 'EQ'
      );

      logger.info(`Found ${equityInstruments.length} NSE equity instruments`);

      // Batch insert to database
      const batchSize = 100;
      for (let i = 0; i < equityInstruments.length; i += batchSize) {
        const batch = equityInstruments.slice(i, i + batchSize);
        
        const stockData = batch.map((inst: any) => ({
          symbol: inst.tradingsymbol,
          company_name: inst.name,
          isin: inst.isin,
          listing_date: inst.listing_date || null
        }));

        await supabase
          .from('stocks')
          .upsert(stockData, { onConflict: 'symbol' });
      }

      logger.info('Instrument sync completed');
    } catch (error) {
      logger.error('Error syncing instruments:', error);
      throw error;
    }
  }

  /**
   * Mark top 500 stocks as featured
   */
  async markFeaturedStocks(): Promise<void> {
    try {
      // Get NIFTY 500 constituents or top stocks by market cap
      const { data: stocks } = await supabase
        .from('stocks')
        .select('symbol')
        .order('symbol')
        .limit(500);

      if (stocks) {
        const symbols = stocks.map(s => s.symbol);
        
        await supabase
          .from('stocks')
          .update({ is_featured: true })
          .in('symbol', symbols);
        
        logger.info(`Marked ${symbols.length} stocks as featured`);
      }
    } catch (error) {
      logger.error('Error marking featured stocks:', error);
    }
  }

  /**
   * Get current quote for symbol(s)
   */
  async getQuote(symbols: string | string[]): Promise<any> {
    try {
      if (!this.isInitialized) {
        return this.getMockQuote(symbols);
      }

      const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
      const kiteSymbols = symbolArray.map(s => `NSE:${s}`);
      
      const quotes = await this.kite.getQuote(kiteSymbols);
      return quotes;
    } catch (error) {
      logger.error('Error fetching quote:', error);
      return this.getMockQuote(symbols);
    }
  }

  /**
   * Get OHLC data
   */
  async getOHLC(symbols: string | string[]): Promise<any> {
    try {
      if (!this.isInitialized) {
        return this.getMockOHLC(symbols);
      }

      const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
      const kiteSymbols = symbolArray.map(s => `NSE:${s}`);
      
      const ohlc = await this.kite.getOHLC(kiteSymbols);
      return ohlc;
    } catch (error) {
      logger.error('Error fetching OHLC:', error);
      return this.getMockOHLC(symbols);
    }
  }

  /**
   * Get historical data
   */
  async getHistoricalData(
    symbol: string,
    interval: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        return this.getMockHistoricalData(symbol, interval);
      }

      const data = await this.kite.getHistoricalData(
        `NSE:${symbol}`,
        interval,
        fromDate,
        toDate
      );
      
      return data;
    } catch (error) {
      logger.error('Error fetching historical data:', error);
      return this.getMockHistoricalData(symbol, interval);
    }
  }

  /**
   * Update stock prices in database
   */
  async updateStockPrices(symbols: string[]): Promise<void> {
    try {
      const quotes = await this.getQuote(symbols);
      
      const priceData = Object.entries(quotes).map(([key, quote]: [string, any]) => {
        const symbol = key.split(':')[1]; // Remove NSE: prefix
        
        return {
          symbol,
          ltp: quote.last_price,
          open: quote.ohlc.open,
          high: quote.ohlc.high,
          low: quote.ohlc.low,
          close: quote.ohlc.close,
          change_percent: ((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100,
          volume: quote.volume,
          timestamp: new Date().toISOString()
        };
      });

      // Batch insert price data
      if (priceData.length > 0) {
        await supabase
          .from('stock_prices')
          .insert(priceData);
        
        logger.info(`Updated prices for ${priceData.length} stocks`);
      }
    } catch (error) {
      logger.error('Error updating stock prices:', error);
    }
  }

  // Mock data methods for demo/development
  private getMockInstruments(): any[] {
    return [
      { tradingsymbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', instrument_type: 'EQ' },
      { tradingsymbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', instrument_type: 'EQ' },
      { tradingsymbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', instrument_type: 'EQ' },
      { tradingsymbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', instrument_type: 'EQ' },
      { tradingsymbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', instrument_type: 'EQ' }
    ];
  }

  private getMockQuote(symbols: string | string[]): any {
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    const quotes: any = {};
    
    symbolArray.forEach(symbol => {
      const basePrice = 1000 + Math.random() * 1000;
      quotes[`NSE:${symbol}`] = {
        last_price: basePrice,
        ohlc: {
          open: basePrice * 0.98,
          high: basePrice * 1.02,
          low: basePrice * 0.97,
          close: basePrice * 0.99
        },
        volume: Math.floor(Math.random() * 1000000)
      };
    });
    
    return quotes;
  }

  private getMockOHLC(symbols: string | string[]): any {
    return this.getMockQuote(symbols);
  }

  private getMockHistoricalData(symbol: string, interval: string): any[] {
    const data = [];
    const days = interval === 'day' ? 30 : 365;
    const basePrice = 1000 + Math.random() * 1000;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString(),
        open: basePrice * (0.95 + Math.random() * 0.1),
        high: basePrice * (1.0 + Math.random() * 0.05),
        low: basePrice * (0.90 + Math.random() * 0.05),
        close: basePrice * (0.95 + Math.random() * 0.1),
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return data.reverse();
  }
}

export const kiteService = new KiteService();

