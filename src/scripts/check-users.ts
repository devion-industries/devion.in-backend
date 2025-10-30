import { supabaseAdmin as supabase } from '../config/database';

/**
 * Check all users in the database
 */
async function checkUsers() {
  try {
    console.log('👥 Fetching all users...\n');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, alias, created_at')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found!');
      return;
    }

    console.log(`📋 Found ${users.length} users:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.alias || '(no alias)'} (${user.email}) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });

  } catch (error: any) {
    console.error('❌ Check failed:', error.message);
    throw error;
  }
}

// Run check
checkUsers()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });



