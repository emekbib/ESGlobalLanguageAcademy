import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    const isProduction = process.env.NODE_ENV === 'production';
    const deleteOpts = {
      maxAge: 0,
      path: '/',
      sameSite: 'lax' as const,
      secure: isProduction,
    };

    const allCookies = cookieStore.getAll();
    let deletedCount = 0;

    for (const cookie of allCookies) {
      // Match the Supabase auth-token cookie and any chunked variants (e.g. sb-xxx-auth-token.0, .1, etc.)
      if (cookie.name.includes('-auth-token')) {
        cookieStore.set(cookie.name, '', deleteOpts);
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      console.warn('[signout] No auth-token cookies found to delete');
    }

    return NextResponse.json({ success: true, deleted: deletedCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[signout] Sign out error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out completely. Please refresh and try again.' },
      { status: 500 },
    );
  }
}
