-- Create user badges table for storing user badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  date_awarded TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  
  -- Add a unique constraint to prevent duplicate badges for a user
  UNIQUE(user_id, badge_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);

-- Add row level security (RLS) policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy for selecting: only allow users to see their own badges
CREATE POLICY select_own_badges ON user_badges 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Policy for inserting: users can only insert their own badges
CREATE POLICY insert_own_badges ON user_badges 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for deleting: users can only delete their own badges
CREATE POLICY delete_own_badges ON user_badges 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Policy for updating: users can only update their own badges
CREATE POLICY update_own_badges ON user_badges 
  FOR UPDATE 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow service role to have full access
CREATE POLICY service_role_all_access ON user_badges 
  FOR ALL 
  TO service_role 
  USING (true); 