'use client';

import { LogOut, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LogoutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch {
      window.location.href = '/auth';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-4 ring-rose-50/50">
            <LogOut className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900">
              Sign out of ESGlobal?
            </h3>
            <p className="text-xs text-stone-500">Confirm sign out</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-stone-600 leading-relaxed">
          Are you sure you want to sign out? You will need to log back in to access your upcoming 1-on-1 lessons and teacher calendar.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? 'Signing out…' : 'Yes, Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
