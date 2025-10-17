import yahooFinance from 'yahoo-finance2';
import { supabaseAdmin as supabase } from '../config/database';
import logger from '../utils/logger';

// NSE sector mapping based on common patterns
const SECTOR_PATTERNS = {
  'BANK': 'Banking',
  'FIN': 'Finance',
  'INSURANCE': 'Insurance',
  'IT': 'IT',
  'TECH': 'IT',
  'PHARMA': 'Pharma',
  'HEALTH': 'Healthcare',
  'AUTO': 'Auto',
  'MOTOR': 'Auto',
  'STEEL': 'Steel',
  'METAL': 'Metals',
  'CEMENT': 'Cement',
  'POWER': 'Power',
  'ENERGY': 'Energy',
  'OIL': 'Energy',
  'GAS': 'Energy',
  'TELECOM': 'Telecom',
  'AIRTEL': 'Telecom',
  'INFRA': 'Infrastructure',
  'CONSTRUCT': 'Infrastructure',
  'PAINT': 'Paint',
  'CHEMICAL': 'Chemicals',
  'FERTILIZER': 'Chemicals',
  'FMCG': 'FMCG',
  'CONSUMER': 'FMCG',
  'RETAIL': 'Retail',
  'TEXTILE': 'Textiles',
  'PAPER': 'Paper',
  'MINING': 'Mining',
  'COAL': 'Mining',
  'REALTY': 'Real Estate',
  'HOUSING': 'Real Estate',
  'MEDIA': 'Media',
  'ENTERTAINMENT': 'Media',
  'HOTEL': 'Hospitality',
  'AVIATION': 'Aviation',
  'SHIPPING': 'Shipping',
  'PORT': 'Infrastructure'
};

// Known sector mappings for major companies
const KNOWN_SECTORS: Record<string, string> = {
  // Banking
  'HDFCBANK': 'Banking',
  'ICICIBANK': 'Banking',
  'SBIN': 'Banking',
  'KOTAKBANK': 'Banking',
  'AXISBANK': 'Banking',
  'INDUSINDBK': 'Banking',
  'BANDHANBNK': 'Banking',
  'FEDERALBNK': 'Banking',
  'IDFCFIRSTB': 'Banking',
  'PNB': 'Banking',
  'BANKBARODA': 'Banking',
  
  // IT
  'TCS': 'IT',
  'INFY': 'IT',
  'HCLTECH': 'IT',
  'WIPRO': 'IT',
  'TECHM': 'IT',
  'LTI': 'IT',
  'COFORGE': 'IT',
  'PERSISTENT': 'IT',
  'MPHASIS': 'IT',
  
  // Auto
  'MARUTI': 'Auto',
  'TATAMOTORS': 'Auto',
  'M&M': 'Auto',
  'EICHERMOT': 'Auto',
  'HEROMOTOCO': 'Auto',
  'BAJAJ-AUTO': 'Auto',
  'TVSMOTOR': 'Auto',
  'ASHOKLEY': 'Auto',
  'MOTHERSON': 'Auto',
  
  // Pharma
  'SUNPHARMA': 'Pharma',
  'DRREDDY': 'Pharma',
  'CIPLA': 'Pharma',
  'DIVISLAB': 'Pharma',
  'BIOCON': 'Pharma',
  'LUPIN': 'Pharma',
  'AUROPHARMA': 'Pharma',
  'TORNTPHARM': 'Pharma',
  
  // FMCG
  'HINDUNILVR': 'FMCG',
  'ITC': 'FMCG',
  'NESTLEIND': 'FMCG',
  'BRITANNIA': 'FMCG',
  'DABUR': 'FMCG',
  'MARICO': 'FMCG',
  'GODREJCP': 'FMCG',
  'COLPAL': 'FMCG',
  
  // Energy
  'RELIANCE': 'Energy',
  'ONGC': 'Energy',
  'BPCL': 'Energy',
  'IOC': 'Energy',
  'GAIL': 'Energy',
  
  // Infrastructure
  'LT': 'Infrastructure',
  'ADANIPORTS': 'Infrastructure',
  'POWERGRID': 'Power',
  'NTPC': 'Power',
  
  // Cement
  'ULTRACEMCO': 'Cement',
  'GRASIM': 'Cement',
  'SHREECEM': 'Cement',
  'ACC': 'Cement',
  'AMBUJACEM': 'Cement',
  
  // Steel
  'TATASTEEL': 'Steel',
  'JSWSTEEL': 'Steel',
  'SAIL': 'Steel',
  'JINDALSTEL': 'Steel',
  
  // Telecom
  'BHARTIARTL': 'Telecom',
  'RCOM': 'Telecom',
  
  // Finance
  'BAJFINANCE': 'Finance',
  'BAJAJFINSV': 'Finance',
  'CHOLAFIN': 'Finance',
  'MUTHOOTFIN': 'Finance',
  'SBICARD': 'Finance',
  'HDFCLIFE': 'Insurance',
  'ICICIPRULI': 'Insurance',
  'SBILIFE': 'Insurance',
  
  // Others
  'TITAN': 'Retail',
  'ASIANPAINT': 'Paint',
  'COALINDIA': 'Mining',
  'HINDALCO': 'Metals',
  'VEDL': 'Metals',
  'ADANIENT': 'Conglomerate',
  'TATACONSUM': 'FMCG',
  'PIDILITIND': 'Chemicals'
};

/**
 * Infer sector from company name using patterns
 */
function inferSectorFromName(symbol: string, companyName: string): string | null {
  // Check known mappings first
  if (KNOWN_SECTORS[symbol]) {
    return KNOWN_SECTORS[symbol];
  }
  
  // Check patterns in symbol and company name
  const searchText = `${symbol} ${companyName}`.toUpperCase();
  
  for (const [pattern, sector] of Object.entries(SECTOR_PATTERNS)) {
    if (searchText.includes(pattern)) {
      return sector;
    }
  }
  
  return null;
}

/**
 * Fetch sector from Yahoo Finance
 */
async function fetchSectorFromYahoo(symbol: string): Promise<string | null> {
  try {
    const quote = await yahooFinance.quote(`${symbol}.NS`) as any;
    
    // Yahoo Finance provides sector information
    if (quote.quoteType && quote.quoteType.sector) {
      return mapYahooSectorToOurSector(quote.quoteType.sector);
    }
    
    // Try to get from summary detail
    if (quote.summaryProfile && quote.summaryProfile.sector) {
      return mapYahooSectorToOurSector(quote.summaryProfile.sector);
    }
    
    return null;
  } catch (error) {
    // Stock not found or API error - silently return null
    return null;
  }
}

/**
 * Map Yahoo Finance sector names to our simplified sector names
 */
function mapYahooSectorToOurSector(yahooSector: string): string {
  const sectorMap: Record<string, string> = {
    'Financial Services': 'Banking',
    'Technology': 'IT',
    'Healthcare': 'Pharma',
    'Consumer Cyclical': 'Consumer',
    'Consumer Defensive': 'FMCG',
    'Energy': 'Energy',
    'Industrials': 'Infrastructure',
    'Basic Materials': 'Metals',
    'Communication Services': 'Telecom',
    'Real Estate': 'Real Estate',
    'Utilities': 'Power'
  };
  
  return sectorMap[yahooSector] || yahooSector;
}

/**
 * Update sectors for all stocks in database
 */
async function updateAllSectors() {
  try {
    console.log('🔄 Starting sector update for all stocks...\n');
    
    // Get all stocks from database (no limit, fetch all)
    let allStocks: any[] = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data: stocks, error } = await supabase
        .from('stocks')
        .select('symbol, company_name, sector')
        .order('symbol')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error('❌ Error fetching stocks:', error);
        return;
      }
      
      if (!stocks || stocks.length === 0) break;
      
      allStocks = allStocks.concat(stocks);
      console.log(`   Fetched page ${page + 1}: ${stocks.length} stocks`);
      
      if (stocks.length < pageSize) break; // Last page
      page++;
    }
    
    const stocks = allStocks;
    
    console.log(`📊 Found ${stocks.length} stocks to process\n`);
    
    let updated = 0;
    let inferred = 0;
    let fromYahoo = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process in batches
    const batchSize = 10;
    
    for (let i = 0; i < stocks.length; i += batchSize) {
      const batch = stocks.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stocks.length / batchSize)}`);
      console.log(`   Stocks ${i + 1} to ${Math.min(i + batchSize, stocks.length)}`);
      
      // Process each stock in the batch
      const updatePromises = batch.map(async (stock) => {
        try {
          // Skip if sector already populated
          if (stock.sector) {
            skipped++;
            return;
          }
          
          let sector: string | null = null;
          let source = '';
          
          // Try to fetch from Yahoo Finance first
          sector = await fetchSectorFromYahoo(stock.symbol);
          if (sector) {
            source = 'Yahoo Finance';
            fromYahoo++;
          } else {
            // Infer from company name
            sector = inferSectorFromName(stock.symbol, stock.company_name);
            if (sector) {
              source = 'Inferred';
              inferred++;
            }
          }
          
          // Update database if we found a sector
          if (sector) {
            const { error: updateError } = await supabase
              .from('stocks')
              .update({ sector })
              .eq('symbol', stock.symbol);
            
            if (updateError) {
              console.error(`   ❌ Error updating ${stock.symbol}:`, updateError.message);
              errors++;
            } else {
              console.log(`   ✅ ${stock.symbol}: ${sector} (${source})`);
              updated++;
            }
          } else {
            console.log(`   ⚠️  ${stock.symbol}: No sector found`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error: any) {
          console.error(`   ❌ Error processing ${stock.symbol}:`, error.message);
          errors++;
        }
      });
      
      // Wait for all stocks in batch to complete
      await Promise.all(updatePromises);
      
      // Progress summary
      console.log(`   Progress: ${updated} updated, ${skipped} skipped, ${errors} errors`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ SECTOR UPDATE COMPLETE!\n');
    console.log(`📊 Statistics:`);
    console.log(`   Total stocks: ${stocks.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   - From Yahoo Finance: ${fromYahoo}`);
    console.log(`   - Inferred: ${inferred}`);
    console.log(`   Already had sector: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   No sector found: ${stocks.length - updated - skipped - errors}`);
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    logger.error('Sector update failed:', error);
  }
}

// Run the update
updateAllSectors()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

