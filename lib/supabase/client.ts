'use client';

import { createBrowserClient } from '@supabase/ssr';

function getSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    'https://xavkprxarmlfdqulyhgd.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    'sb_publishable_JLFsW2kTkmC4SCZcCGT0kA_UXo1FWDA';

  return { url, anonKey };
}

const config = getSupabaseConfig();

// autoRefreshToken is set to false because the middleware is the single source
// of truth for token refresh. When both the browser client and the middleware
// auto-refresh, Supabase's refresh-token rotation causes them to invalidate
// each other's refresh token, killing sessions within minutes. The middleware
// calls getUser() on every navigation, which refreshes server-side. If the
// client detects a stale session (getUser() fails), it clears the session and
// sends the user to /auth.
const supabase = createBrowserClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function createSupabaseBrowserClient() {
  return supabase;
}
