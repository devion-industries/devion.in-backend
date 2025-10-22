import { supabaseAdmin as supabase } from './src/config/database';

async function checkSchema() {
  // Get one trade to see actual structure
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Trade columns:', Object.keys(data));
    console.log('\nFull data:', JSON.stringify(data, null, 2));
  }
  
  process.exit(0);
}

checkSchema();

