import yahooFinance from 'yahoo-finance2';
import { supabase } from '../config/database';
import logger from '../utils/logger';

// Curated list of top NSE stocks (NIFTY 500 constituents + popular stocks)
const NSE_STOCKS = [
  // NIFTY 50
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Paint' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Auto' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Retail' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Finance' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Conglomerate' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Auto' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Power' },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power' },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd', sector: 'Energy' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Finance' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Auto' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Mining' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Steel' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Steel' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd', sector: 'Pharma' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma' },
  { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd', sector: 'Pharma' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Auto' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Cement' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Auto' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Cement' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', sector: 'FMCG' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', sector: 'Energy' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', sector: 'Insurance' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd', sector: 'Power' },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd', sector: 'Power' },
  
  // NIFTY Next 50 (Top 30)
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Auto' },
  { symbol: 'SIEMENS', name: 'Siemens Ltd', sector: 'Engineering' },
  { symbol: 'DLF', name: 'DLF Ltd', sector: 'Realty' },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd', sector: 'FMCG' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd', sector: 'Chemicals' },
  { symbol: 'VEDL', name: 'Vedanta Ltd', sector: 'Mining' },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', sector: 'Cement' },
  { symbol: 'ACC', name: 'ACC Ltd', sector: 'Cement' },
  { symbol: 'HAVELLS', name: 'Havells India Ltd', sector: 'Electricals' },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance Company Ltd', sector: 'Insurance' },
  { symbol: 'BERGEPAINT', name: 'Berger Paints India Ltd', sector: 'Paint' },
  { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'FMCG' },
  { symbol: 'MARICO', name: 'Marico Ltd', sector: 'FMCG' },
  { symbol: 'MCDOWELL-N', name: 'United Spirits Ltd', sector: 'Beverages' },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Ltd', sector: 'Pharma' },
  { symbol: 'LUPIN', name: 'Lupin Ltd', sector: 'Pharma' },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking' },
  { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking' },
  { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking' },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd', sector: 'Aviation' },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd', sector: 'Energy' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd', sector: 'Energy' },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd', sector: 'Auto Components' },
  { symbol: 'ABB', name: 'ABB India Ltd', sector: 'Engineering' },
  { symbol: 'COLPAL', name: 'Colgate Palmolive (India) Ltd', sector: 'FMCG' },
  { symbol: 'PAGEIND', name: 'Page Industries Ltd', sector: 'Retail' },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International Ltd', sector: 'Auto Components' },
  { symbol: 'PIIND', name: 'PI Industries Ltd', sector: 'Chemicals' },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'IT' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', sector: 'IT' },
  
  // Additional Popular Stocks (70 more to reach 150)
  { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'Food Tech' },
  { symbol: 'PAYTM', name: 'One 97 Communications Ltd', sector: 'Fintech' },
  { symbol: 'POLICYBZR', name: 'PB Fintech Ltd', sector: 'Insurtech' },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd', sector: 'E-commerce' },
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd', sector: 'Retail' },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd', sector: 'IT' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT' },
  { symbol: 'COFORGE', name: 'Coforge Ltd', sector: 'IT' },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd', sector: 'Electronics' },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd', sector: 'Cables' },
  { symbol: 'IRCTC', name: 'Indian Railway Catering and Tourism Corporation Ltd', sector: 'Tourism' },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation Ltd', sector: 'Finance' },
  { symbol: 'IDEA', name: 'Vodafone Idea Ltd', sector: 'Telecom' },
  { symbol: 'YESBANK', name: 'Yes Bank Ltd', sector: 'Banking' },
  { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', sector: 'Banking' },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', sector: 'Banking' },
  { symbol: 'RBLBANK', name: 'RBL Bank Ltd', sector: 'Banking' },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', sector: 'Banking' },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment and Finance Company Ltd', sector: 'Finance' },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', sector: 'Finance' },
  { symbol: 'PNBHOUSING', name: 'PNB Housing Finance Ltd', sector: 'Finance' },
  { symbol: 'L&TFH', name: 'L&T Finance Holdings Ltd', sector: 'Finance' },
  { symbol: 'LICHSGFIN', name: 'LIC Housing Finance Ltd', sector: 'Finance' },
  { symbol: 'RECLTD', name: 'REC Ltd', sector: 'Finance' },
  { symbol: 'PFC', name: 'Power Finance Corporation Ltd', sector: 'Finance' },
  { symbol: 'ADANITRANS', name: 'Adani Transmission Ltd', sector: 'Power' },
  { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', sector: 'Power' },
  { symbol: 'SUZLON', name: 'Suzlon Energy Ltd', sector: 'Power' },
  { symbol: 'TATACOMM', name: 'Tata Communications Ltd', sector: 'Telecom' },
  { symbol: 'MTNL', name: 'Mahanagar Telephone Nigam Ltd', sector: 'Telecom' },
  { symbol: 'GMRINFRA', name: 'GMR Infrastructure Ltd', sector: 'Infrastructure' },
  { symbol: 'IRBINVIT', name: 'IRB InvIT Fund', sector: 'Infrastructure' },
  { symbol: 'PVR', name: 'PVR Ltd', sector: 'Entertainment' },
  { symbol: 'INOXLEISUR', name: 'INOX Leisure Ltd', sector: 'Entertainment' },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Ltd', sector: 'QSR' },
  { symbol: 'WESTLIFE', name: 'Westlife Development Ltd', sector: 'QSR' },
  { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail' },
  { symbol: 'VMART', name: 'V-Mart Retail Ltd', sector: 'Retail' },
  { symbol: 'ABFRL', name: 'Aditya Birla Fashion and Retail Ltd', sector: 'Retail' },
  { symbol: 'RELAXO', name: 'Relaxo Footwears Ltd', sector: 'Footwear' },
  { symbol: 'BATA', name: 'Bata India Ltd', sector: 'Footwear' },
  { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer Electricals Ltd', sector: 'Electricals' },
  { symbol: 'VOLTAS', name: 'Voltas Ltd', sector: 'Consumer Durables' },
  { symbol: 'WHIRLPOOL', name: 'Whirlpool of India Ltd', sector: 'Consumer Durables' },
  { symbol: 'VBL', name: 'Varun Beverages Ltd', sector: 'Beverages' },
  { symbol: 'TATACHEMICAL', name: 'Tata Chemicals Ltd', sector: 'Chemicals' },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd', sector: 'Chemicals' },
  { symbol: 'AARTI', name: 'Aarti Industries Ltd', sector: 'Chemicals' },
  { symbol: 'BALRAMCHIN', name: 'Balrampur Chini Mills Ltd', sector: 'Sugar' },
  { symbol: 'DALBHARAT', name: 'Dalmia Bharat Ltd', sector: 'Cement' },
  { symbol: 'RAMCOCEM', name: 'The Ramco Cements Ltd', sector: 'Cement' },
  { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power Ltd', sector: 'Steel' },
  { symbol: 'SAIL', name: 'Steel Authority of India Ltd', sector: 'Steel' },
  { symbol: 'NMDC', name: 'NMDC Ltd', sector: 'Mining' },
  { symbol: 'NATIONALUM', name: 'National Aluminium Company Ltd', sector: 'Metals' },
  { symbol: 'APARINDS', name: 'Apar Industries Ltd', sector: 'Cables' },
  { symbol: 'KEI', name: 'KEI Industries Ltd', sector: 'Cables' },
  { symbol: 'CUMMINSIND', name: 'Cummins India Ltd', sector: 'Engineering' },
  { symbol: 'THERMAX', name: 'Thermax Ltd', sector: 'Engineering' },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd', sector: 'Engineering' },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd', sector: 'Defence' },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', sector: 'Defence' },
  { symbol: 'GRSE', name: 'Garden Reach Shipbuilders & Engineers Ltd', sector: 'Defence' },
  { symbol: 'CONCOR', name: 'Container Corporation of India Ltd', sector: 'Logistics' },
  { symbol: 'BLUEDART', name: 'Blue Dart Express Ltd', sector: 'Logistics' },
  { symbol: 'DELHIVERY', name: 'Delhivery Ltd', sector: 'Logistics' },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd', sector: 'Realty' },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd', sector: 'Realty' },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects Ltd', sector: 'Realty' },
];

yahooFinance.setGlobalConfig({
  queue: {
    concurrency: 5,
    timeout: 60000
  }
});

class YahooFinanceService {
  /**
   * Get quote for a stock
   */
  async getQuote(symbols: string | string[]): Promise<any> {
    try {
      const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
      const yahooSymbols = symbolArray.map(s => `${s}.NS`);
      
      if (yahooSymbols.length === 1) {
        const quote = await yahooFinance.quote(yahooSymbols[0]);
        return { [`NSE:${symbolArray[0]}`]: this.formatQuote(quote) };
      }
      
      // For multiple symbols, fetch in parallel
      const quotes = await Promise.allSettled(
        yahooSymbols.map(symbol => yahooFinance.quote(symbol))
      );
      
      const result: any = {};
      quotes.forEach((quote, index) => {
        if (quote.status === 'fulfilled' && quote.value) {
          result[`NSE:${symbolArray[index]}`] = this.formatQuote(quote.value);
        }
      });
      
      return result;
    } catch (error) {
      logger.error('Error fetching quote from Yahoo Finance:', error);
      return this.getMockQuote(Array.isArray(symbols) ? symbols : [symbols]);
    }
  }

  /**
   * Format Yahoo Finance quote to match Kite format
   */
  private formatQuote(quote: any): any {
    return {
      last_price: quote.regularMarketPrice || 0,
      volume: quote.regularMarketVolume || 0,
      ohlc: {
        open: quote.regularMarketOpen || quote.regularMarketPrice || 0,
        high: quote.regularMarketDayHigh || quote.regularMarketPrice || 0,
        low: quote.regularMarketDayLow || quote.regularMarketPrice || 0,
        close: quote.regularMarketPreviousClose || quote.regularMarketPrice || 0
      }
    };
  }

  /**
   * Get historical data for a stock
   */
  async getHistoricalData(
    symbol: string,
    interval: string = 'day',
    from: Date,
    to: Date
  ): Promise<any[]> {
    try {
      const yahooSymbol = `${symbol}.NS`;
      const period1 = from.toISOString().split('T')[0];
      const period2 = to.toISOString().split('T')[0];
      
      const result = await yahooFinance.historical(yahooSymbol, {
        period1,
        period2,
        interval: this.mapInterval(interval)
      });
      
      return result.map(candle => ({
        date: candle.date,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}:`, error);
      return this.getMockHistoricalData();
    }
  }

  /**
   * Map interval format to Yahoo Finance format
   */
  private mapInterval(interval: string): '1d' | '1wk' | '1mo' {
    switch (interval.toLowerCase()) {
      case 'day':
      case '1d':
      case 'daily':
        return '1d';
      case 'week':
      case '1w':
      case 'weekly':
        return '1wk';
      case 'month':
      case '1m':
      case 'monthly':
        return '1mo';
      default:
        return '1d';
    }
  }

  /**
   * Sync curated stock list to database
   */
  async syncStocks(): Promise<void> {
    try {
      logger.info('Starting stock sync with curated NSE list...');
      
      const stockData = NSE_STOCKS.map(stock => ({
        symbol: stock.symbol,
        company_name: stock.name,
        sector: stock.sector,
        is_featured: true // All curated stocks are featured
      }));

      // Insert in batches
      const batchSize = 50;
      for (let i = 0; i < stockData.length; i += batchSize) {
        const batch = stockData.slice(i, i + batchSize);
        await supabase
          .from('stocks')
          .upsert(batch, { onConflict: 'symbol' });
      }

      logger.info(`Synced ${NSE_STOCKS.length} stocks to database`);
    } catch (error) {
      logger.error('Error syncing stocks:', error);
      throw error;
    }
  }

  /**
   * Search stocks (not provided by Yahoo, use database)
   */
  async searchStocks(query: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error searching stocks:', error);
      return [];
    }
  }

  /**
   * Mock quote for development
   */
  private getMockQuote(symbols: string[]): any {
    const result: any = {};
    symbols.forEach(symbol => {
      const basePrice = 1000 + Math.random() * 2000;
      result[`NSE:${symbol}`] = {
        last_price: basePrice,
        volume: Math.floor(Math.random() * 1000000),
        ohlc: {
          open: basePrice * 0.99,
          high: basePrice * 1.02,
          low: basePrice * 0.98,
          close: basePrice * 0.995
        }
      };
    });
    return result;
  }

  /**
   * Mock historical data
   */
  private getMockHistoricalData(): any[] {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const basePrice = 1000 + Math.random() * 500;
      data.push({
        date,
        open: basePrice,
        high: basePrice * 1.02,
        low: basePrice * 0.98,
        close: basePrice * (Math.random() > 0.5 ? 1.01 : 0.99),
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return data;
  }
}

export const yahooService = new YahooFinanceService();

