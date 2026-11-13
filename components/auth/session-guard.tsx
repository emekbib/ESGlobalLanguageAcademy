'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Keeps every open tab bound to the account it was rendered for.
 *
 * Supabase auth lives in browser cookies, which are shared by every tab of the same
 * browser profile. If someone signs in as a different user (or signs out) in another
 * tab, this tab would otherwise keep showing the old person's UI while every request
 * it sends now runs as the new person. That is how data ended up written to the
 * wrong account. When we detect that the signed-in user changed underneath us, we
 * stop and reload so the server re-renders the correct account (or the sign-in page).
 */
let intentionalChange = false;

/** Call before this tab itself signs in or out, so the guard doesn't treat it as a takeover. */
export function markIntentionalAuthChange() {
  intentionalChange = true;
}

export default function SessionGuard() {
  const initialUserId = useRef<string | null | undefined>(undefined);
  const [switched, setSwitched] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    const handleUser = (userId: string | null) => {
      if (cancelled) return;
      if (initialUserId.current === undefined) {
        initialUserId.current = userId;
        return;
      }
      // Anonymous pages (home, sign-in) have nothing to protect; intentional changes are expected.
      if (initialUserId.current === null || intentionalChange) {
        initialUserId.current = userId;
        return;
      }
      if (userId !== initialUserId.current) {
        cancelled = true;
        setSwitched(true);
        window.setTimeout(() => window.location.reload(), 1200);
      }
    };

    void supabase.auth.getSession().then(({ data }) => handleUser(data.session?.user.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      handleUser(session?.user.id ?? null);
    });

    // Cookie changes made by another tab do not always emit an auth event in this tab,
    // so re-check whenever the tab regains focus.
    const recheck = () => {
      if (document.visibilityState !== 'visible') return;
      void supabase.auth.getSession().then(({ data }) => handleUser(data.session?.user.id ?? null));
    };
    document.addEventListener('visibilitychange', recheck);
    window.addEventListener('focus', recheck);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', recheck);
      window.removeEventListener('focus', recheck);
    };
  }, []);

  if (!switched) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-6 backdrop-blur-sm">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-stone-900">
        <p className="font-display text-lg font-bold text-stone-900 dark:text-white">Account changed</p>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          You signed in or out in another tab. Reloading so this tab shows the right account…
        </p>
        <p className="mt-3 text-xs text-stone-400">
          To use two accounts at once, open the second one in a different browser or a private window.
        </p>
      </div>
    </div>
  );
}
