require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testFeaturedStocks() {
  console.log('Testing getFeaturedStocks query...\n');
  
  const { data, error } = await supabase
    .from('stocks')
    .select('*, stock_metadata(*)')
    .eq('is_featured', true)
    .limit(500);
  
  if (error) {
    console.error('ERROR:', error);
    return;
  }
  
  console.log('SUCCESS!');
  console.log('Returned stocks:', data.length);
  console.log('\nFirst 3 stocks:');
  console.table(data.slice(0, 3).map(s => ({
    symbol: s.symbol,
    company_name: s.company_name,
    sector: s.sector,
    is_featured: s.is_featured
  })));
}

testFeaturedStocks();
