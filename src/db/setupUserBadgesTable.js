/**
 * Script to set up user badges table in Supabase
 * 
 * Run this script with:
 * node src/db/setupUserBadgesTable.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupUserBadgesTable() {
  console.log('Starting user_badges table setup...');

  try {
    // Create user_badges table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_user_badges_table');
    
    if (createError) {
      console.log('Using alternative approach to create table...');
      // Alternative approach: direct SQL execution
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_badges (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          date_awarded TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
          
          -- Add a unique constraint to prevent duplicate badges for a user
          UNIQUE(user_id, badge_id)
        );
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('Error creating user_badges table:', sqlError.message);
        return;
      }
    }

    console.log('User badges table created or already exists');

    // Add index for faster queries
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);
    `;
    await supabase.rpc('exec_sql', { sql: createIndexSQL });
    console.log('Added index on user_id');

    // Enable Row Level Security (RLS)
    const enableRlsSQL = `
      ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
    `;
    await supabase.rpc('exec_sql', { sql: enableRlsSQL });
    console.log('Enabled Row Level Security');

    // Add RLS policies
    const policies = [
      {
        name: 'select_own_badges',
        action: 'SELECT',
        check: "auth.uid()::text = user_id"
      },
      {
        name: 'insert_own_badges',
        action: 'INSERT',
        check: "auth.uid()::text = user_id"
      },
      {
        name: 'delete_own_badges',
        action: 'DELETE',
        check: "auth.uid()::text = user_id"
      },
      {
        name: 'update_own_badges',
        action: 'UPDATE',
        check: "auth.uid()::text = user_id"
      },
      {
        name: 'service_role_all_access',
        action: 'ALL',
        check: "true",
        role: 'service_role'
      }
    ];

    for (const policy of policies) {
      const createPolicySQL = policy.role 
        ? `CREATE POLICY IF NOT EXISTS ${policy.name} ON user_badges FOR ${policy.action} TO ${policy.role} USING (${policy.check});`
        : `CREATE POLICY IF NOT EXISTS ${policy.name} ON user_badges FOR ${policy.action} USING (${policy.check});`;
      
      await supabase.rpc('exec_sql', { sql: createPolicySQL });
      console.log(`Created policy: ${policy.name}`);
    }

    console.log('User badges table setup completed successfully!');
  } catch (error) {
    console.error('Unexpected error during user badges table setup:', error);
  }
}

// Run the setup function
setupUserBadgesTable().catch(console.error); 