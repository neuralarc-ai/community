// scripts/backfillEmails.ts
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Make sure dotenv is configured if running outside Next.js context

async function backfillUserEmails() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase URL or Service Role Key not found in environment variables. Please ensure .env.local or similar is configured.');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('Fetching all users from auth.users (requires SUPABASE_SERVICE_ROLE_KEY)...');
  const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();

  if (listUsersError) {
    console.error('Error listing users with admin client:', listUsersError);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('No users found in auth.users to backfill. Exiting.');
    process.exit(0);
  }

  console.log(`Found ${users.length} users. Starting backfill process for profiles table...`);

  for (const user of users) {
    if (user.id && user.email) {
      // Attempt to update the 'email' column in the 'profiles' table
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ email: user.email })
        .eq('id', user.id); // 'id' in profiles links to 'auth.users.id'

      if (updateError) {
        // Log error but continue with other users
        console.error(`Error updating email for profile ID ${user.id} (${user.email}):`, updateError.message);
      } else {
        console.log(`Email for profile ID ${user.id} (${user.email}) backfilled successfully.`);
      }
    } else {
      console.warn(`Skipping user with ID ${user.id}: missing email or ID in auth.users.`);
    }
  }

  console.log('Backfill process completed.');
}

// Ensure the script runs when executed
backfillUserEmails().catch(console.error);
