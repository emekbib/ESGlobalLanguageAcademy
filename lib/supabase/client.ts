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
const supabase = createBrowserClient(config.url, config.anonKey);

export function createSupabaseBrowserClient() {
  return supabase;
}
