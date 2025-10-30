import { supabaseAdmin as supabase } from '../config/database';
import logger from '../utils/logger';

/**
 * Clean up test users from the database
 */
async function cleanupTestUsers() {
  try {
    console.log('🧹 Starting cleanup of test users...\n');

    // Find test users (but keep Demo User as it might be legitimate)
    const { data: testUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, email, alias, created_at')
      .or('alias.ilike.%Test User%,alias.ilike.%test%,alias.ilike.%Portfolio Test%');

    if (fetchError) {
      console.error('❌ Error fetching test users:', fetchError);
      return;
    }

    if (!testUsers || testUsers.length === 0) {
      console.log('✅ No test users found!');
      return;
    }

    console.log(`📋 Found ${testUsers.length} test users:\n`);
    testUsers.forEach(user => {
      console.log(`   - ${user.alias} (${user.email}) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });

    console.log(`\n🗑️  Deleting test users...`);

    // Delete test users
    const userIds = testUsers.map(u => u.id);
    
    // Delete in order to respect foreign key constraints:
    // 1. Delete user_lesson_progress
    console.log('   Deleting lesson progress...');
    await supabase
      .from('user_lesson_progress')
      .delete()
      .in('user_id', userIds);

    // 2. Delete trades
    console.log('   Deleting trades...');
    await supabase
      .from('trades')
      .delete()
      .in('user_id', userIds);

    // 3. Delete holdings (get portfolio IDs first)
    console.log('   Deleting holdings...');
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id')
      .in('user_id', userIds);
    
    if (portfolios && portfolios.length > 0) {
      const portfolioIds = portfolios.map(p => p.id);
      await supabase
        .from('holdings')
        .delete()
        .in('portfolio_id', portfolioIds);
    }

    // 4. Delete portfolios
    console.log('   Deleting portfolios...');
    await supabase
      .from('portfolios')
      .delete()
      .in('user_id', userIds);

    // 5. Delete friendships
    console.log('   Deleting friendships...');
    await supabase
      .from('friendships')
      .delete()
      .or(`user_id.in.(${userIds.join(',')}),friend_id.in.(${userIds.join(',')})`);

    // 6. Delete cohort memberships
    console.log('   Deleting cohort memberships...');
    await supabase
      .from('cohort_members')
      .delete()
      .in('user_id', userIds);

    // 7. Delete user_badges
    console.log('   Deleting badges...');
    await supabase
      .from('user_badges')
      .delete()
      .in('user_id', userIds);

    // 8. Finally, delete users
    console.log('   Deleting user accounts...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .in('id', userIds);

    if (deleteError) {
      console.error('❌ Error deleting users:', deleteError);
      return;
    }

    console.log(`\n✅ Successfully deleted ${testUsers.length} test users!`);
    console.log('\n📊 Summary:');
    console.log(`   - Users deleted: ${testUsers.length}`);
    console.log(`   - Portfolios cleaned: ${portfolios?.length || 0}`);

  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

// Run cleanup
cleanupTestUsers()
  .then(() => {
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  });



