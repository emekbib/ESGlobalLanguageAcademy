import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function redirectWithCookies(request: NextRequest, response: NextResponse, path: string) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const requiresAuth = pathname === '/dashboard' || pathname.startsWith('/teacher/dashboard') || pathname.startsWith('/account') || pathname.startsWith('/onboarding') || pathname.startsWith('/admin');

  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    return redirectWithCookies(request, response, `/auth/callback${request.nextUrl.search}`);
  }

  const supabase = createServerClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (requiresAuth && !user) {
      return redirectWithCookies(request, response, '/auth');
    }

    if (user && (pathname === '/dashboard' || pathname.startsWith('/teacher/dashboard') || pathname.startsWith('/onboarding'))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, suspended_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile && pathname !== '/onboarding') {
        return redirectWithCookies(request, response, '/onboarding');
      }

      if (profile) {
        if (pathname.startsWith('/admin') && profile.role !== 'admin') {
          return redirectWithCookies(request, response, '/');
        }
        if (profile.suspended_at && !pathname.startsWith('/admin')) {
          return redirectWithCookies(request, response, '/');
        }
        const destination = profile.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
        if (pathname === '/onboarding' || (profile.role === 'teacher' && pathname === '/dashboard') || (profile.role === 'student' && pathname.startsWith('/teacher/dashboard'))) {
          return redirectWithCookies(request, response, destination);
        }
      }
    }
  } catch {
    if (requiresAuth) {
      return redirectWithCookies(request, response, '/auth');
    }
  }

  return response;
}
