import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Used by React Server Component pages (e.g. app/(admin)/admin/page.tsx).
 * Redirects unauthenticated or non-admin visitors via Next.js navigation.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, role, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') redirect('/');
  return { supabase, user, profile };
}

/**
 * Used by API Route Handlers (e.g. app/api/admin/*).
 * Safely returns JSON status codes without throwing Next.js NEXT_REDIRECT exceptions.
 */
export async function requireAdminApi() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
      error: 'Authentication required. Please sign in.',
      status: 401 as const,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, role, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    return {
      supabase,
      user,
      profile: null,
      error: 'Access forbidden. Administrator privileges required.',
      status: 403 as const,
    };
  }

  return { supabase, user, profile, error: null, status: 200 as const };
}
