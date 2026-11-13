import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Returns the signed-in user only if it is the same account this screen was rendered for.
 * Every write that is keyed on "the current user" must go through this: browser cookies
 * are shared across tabs, so a sign-in in another tab silently changes who `getUser()`
 * returns, and the write would otherwise land on the wrong person's account.
 */
export async function getSameUser(
  supabase: SupabaseClient,
  expectedUserId: string,
): Promise<{ user: User | null; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, error: 'Your session has ended. Please sign in again.' };
  if (user.id !== expectedUserId) {
    if (typeof window !== 'undefined') window.setTimeout(() => window.location.reload(), 1500);
    return {
      user: null,
      error: 'You are now signed in as a different account in this browser. Nothing was saved — reloading.',
    };
  }
  return { user, error: null };
}
