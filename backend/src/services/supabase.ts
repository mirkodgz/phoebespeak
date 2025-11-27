import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'Supabase URL or service role key not set. Database operations will fail until these are configured.',
  );
}

export const supabaseServerClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const getSupabaseClient = () => {
  if (!supabaseServerClient) {
    throw new Error('Supabase client not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  return supabaseServerClient;
};

