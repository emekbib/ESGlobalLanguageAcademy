import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function redirectWithCookies(request: NextRequest, response: NextResponse, path: string) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days persistent session
    });
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    return redirectWithCookies(request, response, `/auth/callback${request.nextUrl.search}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing from environment. Skipping session check.');
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              path: options?.path || '/',
              sameSite: options?.sameSite || 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          });
        },
      },
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Strict admin unauthenticated guard
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !user) {
      return redirectWithCookies(request, response, '/admin/login');
    }

    // 2. Standard auth requirements
    const isStandardRequiresAuth =
      pathname === '/dashboard' ||
      pathname.startsWith('/teacher/dashboard') ||
      pathname.startsWith('/account') ||
      pathname.startsWith('/onboarding');

    if (isStandardRequiresAuth && !user) {
      return redirectWithCookies(request, response, '/auth');
    }

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, suspended_at')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      // If user is suspended, block access
      if (profile?.suspended_at && !pathname.startsWith('/admin')) {
        return redirectWithCookies(request, response, '/');
      }

      // CRITICAL: Block any non-admin from accessing /admin routes
      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!profile || profile.role !== 'admin') {
          return redirectWithCookies(request, response, '/');
        }
      }

      // Redirect away from admin login if already an admin
      if (pathname === '/admin/login') {
        if (profile?.role === 'admin') {
          return redirectWithCookies(request, response, '/admin');
        }
      }

      if (profile) {
        if (profile.role === 'admin') {
          if (pathname === '/auth') {
            return redirectWithCookies(request, response, '/admin');
          }
        } else {
          // If a student tries to access teacher dashboard, or vice-versa
          if (profile.role === 'student' && pathname.startsWith('/teacher/dashboard')) {
            return redirectWithCookies(request, response, '/dashboard');
          }
          if (profile.role === 'teacher' && pathname === '/dashboard') {
            return redirectWithCookies(request, response, '/teacher/dashboard');
          }
          if (pathname === '/auth' || pathname === '/onboarding') {
            const dest = profile.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
            return redirectWithCookies(request, response, dest);
          }
        }
      } else if (pathname !== '/onboarding' && isStandardRequiresAuth) {
        return redirectWithCookies(request, response, '/onboarding');
      }
    }
  } catch (err) {
    console.warn('Middleware auth check warning:', err);
    // Security fail-safe: never allow uncaught errors to leak /admin
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return redirectWithCookies(request, response, '/admin/login');
    }
  }

  return response;
}
