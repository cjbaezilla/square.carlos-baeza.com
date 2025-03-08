-- Create user_items table to store item information in Supabase
-- Each row represents one item owned by a specific user

-- Drop the table if it exists (uncomment if needed for recreation)
-- DROP TABLE IF EXISTS user_items;

CREATE TABLE IF NOT EXISTS user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID for each item instance
  user_id TEXT NOT NULL,                         -- User ID from Clerk
  item_id TEXT NOT NULL,                         -- Item ID from the ITEMS constant
  instance_id TEXT NOT NULL,                     -- Unique instance ID for this specific item
  rarity TEXT NOT NULL,                          -- Item rarity (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)
  name TEXT NOT NULL,                            -- Item name
  description TEXT NOT NULL,                     -- Item description
  type TEXT NOT NULL,                            -- Item type (HEAD, BODY, etc.)
  svg TEXT NOT NULL,                             -- SVG representation of the item
  stats JSONB NOT NULL,                          -- Item stats as JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When the item was created/acquired
  
  -- Constraints
  UNIQUE(user_id, instance_id),                  -- Each user can only have one instance of a specific item instance
  
  -- RLS Policies for security
  CONSTRAINT user_items_user_id_check CHECK (user_id IS NOT NULL)
);

-- Add comment to the table
COMMENT ON TABLE user_items IS 'Stores user-owned items with their attributes';

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS user_items_user_id_idx ON user_items(user_id);
CREATE INDEX IF NOT EXISTS user_items_item_id_idx ON user_items(item_id);

-- Row Level Security (RLS)
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Users can see their own items
CREATE POLICY user_items_select_policy ON user_items
  FOR SELECT USING (auth.uid()::text = user_id);

-- 2. Users can insert their own items
CREATE POLICY user_items_insert_policy ON user_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 3. Users can update their own items
CREATE POLICY user_items_update_policy ON user_items
  FOR UPDATE USING (auth.uid()::text = user_id);

-- 4. Users can delete their own items
CREATE POLICY user_items_delete_policy ON user_items
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create a separate table for items equipped to mascots
CREATE TABLE IF NOT EXISTS mascot_equipped_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- Unique ID for this equipment relationship
  user_id TEXT NOT NULL,                           -- User ID from Clerk
  mascot_id TEXT NOT NULL,                         -- Mascot ID
  item_instance_id TEXT NOT NULL,                  -- Item instance ID (references user_items.instance_id)
  equipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When the item was equipped
  
  -- Constraints
  UNIQUE(user_id, mascot_id, item_instance_id),    -- Each mascot can only have one of each item instance equipped
  
  -- RLS Policies for security
  CONSTRAINT mascot_equipped_items_user_id_check CHECK (user_id IS NOT NULL)
);

-- Add comment to the table
COMMENT ON TABLE mascot_equipped_items IS 'Stores items equipped to mascots';

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS mascot_equipped_items_user_id_idx ON mascot_equipped_items(user_id);
CREATE INDEX IF NOT EXISTS mascot_equipped_items_mascot_id_idx ON mascot_equipped_items(mascot_id);
CREATE INDEX IF NOT EXISTS mascot_equipped_items_item_instance_id_idx ON mascot_equipped_items(item_instance_id);

-- Row Level Security (RLS)
ALTER TABLE mascot_equipped_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Users can see their own mascot equipped items
CREATE POLICY mascot_equipped_items_select_policy ON mascot_equipped_items
  FOR SELECT USING (auth.uid()::text = user_id);

-- 2. Users can insert their own mascot equipped items
CREATE POLICY mascot_equipped_items_insert_policy ON mascot_equipped_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 3. Users can update their own mascot equipped items
CREATE POLICY mascot_equipped_items_update_policy ON mascot_equipped_items
  FOR UPDATE USING (auth.uid()::text = user_id);

-- 4. Users can delete their own mascot equipped items
CREATE POLICY mascot_equipped_items_delete_policy ON mascot_equipped_items
  FOR DELETE USING (auth.uid()::text = user_id); 