import { supabaseAdmin as supabase } from './src/config/database';

/**
 * Fix existing trades by adding created_at timestamps
 */
async function fixExistingTrades() {
  try {
    console.log('🔧 Fixing existing trades with missing timestamps...\n');

    // Get all trades without created_at
    const { data: trades, error: fetchError } = await supabase
      .from('trades')
      .select('id, executed_at, created_at')
      .is('created_at', null);

    if (fetchError) {
      console.error('❌ Error fetching trades:', fetchError);
      return;
    }

    if (!trades || trades.length === 0) {
      console.log('✅ No trades need fixing!');
      return;
    }

    console.log(`📋 Found ${trades.length} trades without timestamps\n`);

    let fixed = 0;
    let errors = 0;

    for (const trade of trades) {
      try {
        // Use executed_at as the timestamp source, or current time if missing
        const timestamp = trade.executed_at || new Date().toISOString();

        const { error: updateError } = await supabase
          .from('trades')
          .update({
            created_at: timestamp
          })
          .eq('id', trade.id);

        if (updateError) {
          console.error(`   ❌ Failed to update trade ${trade.id}:`, updateError.message);
          errors++;
        } else {
          console.log(`   ✅ Fixed trade ${trade.id}`);
          fixed++;
        }
      } catch (error: any) {
        console.error(`   ❌ Error processing trade ${trade.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Errors: ${errors}`);
    console.log(`\n✅ Timestamp fix complete!`);

  } catch (error: any) {
    console.error('❌ Fix failed:', error.message);
    throw error;
  }
}

// Run fix
fixExistingTrades()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

