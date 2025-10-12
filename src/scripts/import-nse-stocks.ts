import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { supabase } from '../config/database';
import logger from '../utils/logger';

interface NSEStock {
  symbol: string;
  name: string;
  series: string;
  listing_date: string;
  isin: string;
}

async function importNSEStocks() {
  try {
    console.log('📊 Starting NSE stocks import...\n');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../NSE Stocks Equity.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`✅ Found ${records.length} total stocks in CSV\n`);
    
    // Debug: Show column names
    if (records.length > 0) {
      console.log('📋 CSV Columns:', Object.keys(records[0] as Record<string, unknown>));
      console.log('📋 Sample record:', records[0]);
      console.log('');
    }
    
    // Filter for equity stocks only (EQ series)
    const equityStocks = records.filter((record: any) => 
      record['SERIES']?.trim() === 'EQ'
    );
    
    console.log(`✅ Filtered to ${equityStocks.length} equity (EQ) stocks\n`);
    
    // Transform to our format
    const stocksToImport: any[] = equityStocks.map((record: any) => ({
      symbol: record['SYMBOL']?.trim(),
      company_name: record['NAME OF COMPANY']?.trim(),
      isin: record['ISIN NUMBER']?.trim(),
      listing_date: parseListingDate(record['DATE OF LISTING']?.trim()),
      sector: null, // Will be populated later from Yahoo Finance
      market_cap: null,
      is_featured: false // Will mark featured stocks separately
    }));
    
    // Remove any with missing symbols
    const validStocks = stocksToImport.filter(s => s.symbol && s.company_name);
    console.log(`✅ ${validStocks.length} stocks have valid data\n`);
    
    // Import in batches of 100
    const batchSize = 100;
    let imported = 0;
    let errors = 0;
    
    console.log('📥 Importing stocks to database...\n');
    
    for (let i = 0; i < validStocks.length; i += batchSize) {
      const batch = validStocks.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('stocks')
          .upsert(batch, { 
            onConflict: 'symbol',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error(`❌ Error in batch ${i / batchSize + 1}:`, error.message);
          errors += batch.length;
        } else {
          imported += batch.length;
          process.stdout.write(`\r   Imported: ${imported}/${validStocks.length} stocks`);
        }
      } catch (err: any) {
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, err.message);
        errors += batch.length;
      }
    }
    
    console.log('\n');
    
    // Mark top 500 as featured (based on alphabetical order for now)
    console.log('⭐ Marking top 500 stocks as featured...\n');
    
    const { data: topStocks } = await supabase
      .from('stocks')
      .select('symbol')
      .order('symbol')
      .limit(500);
    
    if (topStocks) {
      const symbols = topStocks.map((s: any) => s.symbol);
      
      await supabase
        .from('stocks')
        .update({ is_featured: true })
        .in('symbol', symbols);
      
      console.log(`✅ Marked ${symbols.length} stocks as featured\n`);
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('📊 IMPORT SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total stocks in CSV:     ${records.length}`);
    console.log(`Equity stocks (EQ):      ${equityStocks.length}`);
    console.log(`Valid stocks:            ${validStocks.length}`);
    console.log(`Successfully imported:   ${imported}`);
    console.log(`Errors:                  ${errors}`);
    console.log(`Featured stocks:         500`);
    console.log('═══════════════════════════════════════════════\n');
    
    // Verify database
    const { count } = await supabase
      .from('stocks')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Total stocks in database: ${count}\n`);
    console.log('🎉 Import complete!\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    logger.error('Stock import error:', error);
    process.exit(1);
  }
}

function parseListingDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  try {
    // Date format: DD-MMM-YYYY (e.g., 06-OCT-2008)
    const months: { [key: string]: string } = {
      'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
      'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
      'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    
    const [day, monthStr, year] = dateStr.split('-');
    const month = months[monthStr.toUpperCase()];
    
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  } catch (err) {
    return null;
  }
  
  return null;
}

// Run import
importNSEStocks();

