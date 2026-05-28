import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import ws from 'ws';

const realtimeOpts = { transport: ws as any };

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  realtime: realtimeOpts,
});

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: realtimeOpts,
});
