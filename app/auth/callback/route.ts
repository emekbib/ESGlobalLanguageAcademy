import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('This sign-in link is invalid or has expired.')}`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('We could not complete sign-in.')}`);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/${profile.role === 'teacher' ? 'teacher/dashboard' : 'dashboard'}`);
  }

  return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('No sign-in code was provided.')}`);
}
