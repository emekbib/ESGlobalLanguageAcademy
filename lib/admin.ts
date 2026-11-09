import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Used by React Server Component pages (e.g. app/(admin)/admin/page.tsx).
 * Strictly redirects unauthenticated or non-admin visitors.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, role, full_name, avatar_url')
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  // Strict role check: ONLY admin role is permitted. Students and teachers are immediately redirected.
  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Ensure Estephanos's name is properly displayed and never masked with demo titles
  const isEstephanos =
    user.id === '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f' ||
    user.id === '86f00894-4c35-4dc9-b4fd-bc2d963e5bb1' ||
    (profile.full_name && (profile.full_name.includes('Teacher Demo') || profile.full_name.toLowerCase().includes('estephanos')));

  const displayName = isEstephanos
    ? 'Estephanos Mekbib'
    : profile.full_name || 'Estephanos Mekbib';

  return {
    supabase,
    user,
    profile: {
      ...profile,
      full_name: displayName,
    },
  };
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
    .select('user_id, role, full_name, avatar_url')
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
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

  const isEstephanos =
    user.id === '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f' ||
    user.id === '86f00894-4c35-4dc9-b4fd-bc2d963e5bb1' ||
    (profile.full_name && (profile.full_name.includes('Teacher Demo') || profile.full_name.toLowerCase().includes('estephanos')));

  const displayName = isEstephanos
    ? 'Estephanos Mekbib'
    : profile.full_name || 'Estephanos Mekbib';

  return {
    supabase,
    user,
    profile: {
      ...profile,
      full_name: displayName,
    },
    error: null,
    status: 200 as const,
  };
}
