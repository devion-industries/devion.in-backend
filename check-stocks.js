require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkStocks() {
  // Total stocks
  const { count: totalCount } = await supabase
    .from('stocks')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total stocks:', totalCount);
  
  // Featured stocks
  const { count: featuredCount } = await supabase
    .from('stocks')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true);
  
  console.log('Featured stocks:', featuredCount);
  
  // Sample stocks
  const { data: samples } = await supabase
    .from('stocks')
    .select('symbol, company_name, is_featured')
    .limit(5);
  
  console.log('\nSample stocks:');
  console.table(samples);
}

checkStocks();
