import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function redirectWithCookies(request: NextRequest, response: NextResponse, path: string) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  // Copy refreshed auth cookies onto the redirect with their ORIGINAL attributes.
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    let initResponse = NextResponse.next({ request });
    return redirectWithCookies(request, initResponse, `/auth/callback${request.nextUrl.search}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[middleware] Supabase URL or Anon Key is missing from environment. FAILING CLOSED.');
    const protectedRoutes =
      pathname.startsWith('/admin') ||
      pathname === '/dashboard' ||
      pathname.startsWith('/teacher/dashboard') ||
      pathname.startsWith('/account') ||
      pathname.startsWith('/onboarding');

    if (protectedRoutes) {
      const failRedirect = NextResponse.redirect(new URL('/auth', request.url));
      return failRedirect;
    }
    // For public routes, still delete any auth cookies that may exist
    const failResponse = NextResponse.next({ request });
    return failResponse;
  }

  // Create the response once. setAll will mutate this response object's cookies
  // rather than recreating it, so previously-set cookies are preserved.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on the request cookies so subsequent getUser() calls see the refreshed token
            request.cookies.set(name, value);
            // Set on the response so the browser receives the refreshed cookie
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
    // getUser() is the authority for token refresh. It refreshes server-side.
    // The client should not also auto-refresh — see lib/supabase/client.ts.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const hasAuthCookie = request.cookies.getAll().some((c) => c.name.includes('-auth-token'));
    if (!user && hasAuthCookie) {
      console.warn('[middleware] auth cookie present but no valid user', pathname, authError?.name, authError?.status, authError?.message);
    }

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
      // Deterministic profile lookup — order by created_at, take first, never maybeSingle on duplicates
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, suspended_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
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
    console.warn('[middleware] auth check warning:', err);
    // Security fail-safe: never allow uncaught errors to leak /admin
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return redirectWithCookies(request, response, '/admin/login');
    }
    // For other protected routes, fail closed
    if (
      pathname === '/dashboard' ||
      pathname.startsWith('/teacher/dashboard') ||
      pathname.startsWith('/account')
    ) {
      return redirectWithCookies(request, response, '/auth');
    }
  }

  return response;
}
