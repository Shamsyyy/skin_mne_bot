import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv, hasSupabase } from '../config.js';

export { hasSupabase };

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error('Supabase is not configured');
  }
  if (!client) {
    const env = getEnv();
    client = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
