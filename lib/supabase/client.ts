'use client';

import { createBrowserClient } from '@supabase/ssr';

function getSupabaseConfig() {
  const isServer = typeof window === 'undefined';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY;

  if (isServer) {
    return {
      url: 'https://prerender.invalid',
      anonKey: 'prerender-anon-key',
    };
  }

  if (!url || !anonKey) {
    console.error('Supabase URL or Anon Key is missing from environment.');
    return {
      url: 'https://missing-supabase-env.invalid',
      anonKey: 'missing-key',
    };
  }

  return { url, anonKey };
}

const config = getSupabaseConfig();
const supabase = createBrowserClient(config.url, config.anonKey);

export function createSupabaseBrowserClient() {
  return supabase;
}
