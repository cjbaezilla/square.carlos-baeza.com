import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for standard user-based operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role for operations that need to bypass RLS
// Use this carefully only when absolutely necessary!
const supabaseAdmin = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) : 
  null;

export { supabaseAdmin };
export default supabase; 