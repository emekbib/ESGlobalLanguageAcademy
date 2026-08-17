import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  const { data: profile } = await supabase.from('profiles').select('user_id, role, full_name').eq('user_id', user.id).maybeSingle();
  if (!profile || profile.role !== 'admin') redirect('/');
  return { supabase, user, profile };
}
