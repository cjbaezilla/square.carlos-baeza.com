-- Create user_mascots table for storing user mascots data
CREATE TABLE IF NOT EXISTS user_mascots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mascot_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint to prevent duplicate mascots for a user
  UNIQUE(user_id, mascot_id)
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mascots_user_id ON user_mascots(user_id);

-- Create an index on the active mascot for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mascots_active ON user_mascots(user_id, is_active) WHERE is_active = true;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before an update
DROP TRIGGER IF EXISTS update_user_mascots_updated_at ON user_mascots;
CREATE TRIGGER update_user_mascots_updated_at
BEFORE UPDATE ON user_mascots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add row level security (RLS) policies
ALTER TABLE user_mascots ENABLE ROW LEVEL SECURITY;

-- Policy for selecting: only allow users to see their own mascots
CREATE POLICY select_own_mascots ON user_mascots 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Policy for inserting: users can only insert their own mascots
CREATE POLICY insert_own_mascots ON user_mascots 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for deleting: users can only delete their own mascots
CREATE POLICY delete_own_mascots ON user_mascots 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Policy for updating: users can only update their own mascots
CREATE POLICY update_own_mascots ON user_mascots 
  FOR UPDATE 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow service role to have full access
CREATE POLICY service_role_all_access ON user_mascots 
  FOR ALL 
  TO service_role 
  USING (true); 