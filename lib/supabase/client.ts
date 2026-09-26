'use client';

import { createBrowserClient } from '@supabase/ssr';

function getSupabaseConfig() {
  const isServer = typeof window === 'undefined';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isServer) {
    return {
      url: 'https://prerender.invalid',
      anonKey: 'prerender-anon-key',
    };
  }

  if (!url || !anonKey) {
    throw new Error('Supabase configuration is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to the deployment environment.');
  }

  return { url, anonKey };
}

const config = getSupabaseConfig();
const supabase = createBrowserClient(config.url, config.anonKey);

export function createSupabaseBrowserClient() {
  return supabase;
}
