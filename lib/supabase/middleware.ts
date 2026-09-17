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

    // If trying to access admin routes (except login) without auth, redirect to admin login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !user) {
      return redirectWithCookies(request, response, '/admin/login');
    }

    // Standard auth requirement check
    const isStandardRequiresAuth = pathname === '/dashboard' || pathname.startsWith('/teacher/dashboard') || pathname.startsWith('/account') || pathname.startsWith('/onboarding');
    
    if (isStandardRequiresAuth && !user) {
      return redirectWithCookies(request, response, '/auth');
    }

    // Redirect logged in users away from admin login if they are admin
    if (user && pathname === '/admin/login') {
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
      if (profile?.role === 'admin') {
        return redirectWithCookies(request, response, '/admin');
      }
    }

    if (user && (pathname === '/dashboard' || pathname.startsWith('/teacher/dashboard') || pathname.startsWith('/onboarding') || pathname.startsWith('/admin') || pathname === '/auth')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, suspended_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile && pathname !== '/onboarding') {
        return redirectWithCookies(request, response, '/onboarding');
      }

      if (profile) {
        if (pathname.startsWith('/admin') && pathname !== '/admin/login' && profile.role !== 'admin') {
          return redirectWithCookies(request, response, '/');
        }
        if (profile.suspended_at && !pathname.startsWith('/admin')) {
          return redirectWithCookies(request, response, '/');
        }
        const destination = profile.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
        if (pathname === '/onboarding' || pathname === '/auth' || (profile.role === 'teacher' && pathname === '/dashboard') || (profile.role === 'student' && pathname.startsWith('/teacher/dashboard'))) {
          return redirectWithCookies(request, response, destination);
        }
      }
    }
  } catch {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return redirectWithCookies(request, response, '/admin/login');
    } else if (pathname === '/dashboard' || pathname.startsWith('/teacher/dashboard') || pathname.startsWith('/account') || pathname.startsWith('/onboarding')) {
      return redirectWithCookies(request, response, '/auth');
    }
  }

  return response;
}
