import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deterministically resolves a single profile row for a user.
 *
 * Several accounts have duplicate profiles rows with the same user_id.
 * Using maybeSingle() errors when duplicates exist, causing the caller to
 * treat the profile as missing and redirect wrongly. This helper orders
 * deterministically by created_at and takes exactly one row.
 */
export async function getProfileByUserId<T = Record<string, unknown>>(
  client: SupabaseClient,
  userId: string,
  columns = '*',
): Promise<T | null> {
  const { data, error } = await client
    .from('profiles')
    .select(columns)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getProfileByUserId] error:', error.message);
    return null;
  }
  return (data as T) ?? null;
}
