'use client';

import { useState } from 'react';
import { Loader2, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function ApplicationActions({ teacherId }: { teacherId: string }) {
  const [loading, setLoading] = useState('');
  const [done, setDone] = useState('');
  const supabase = createSupabaseBrowserClient();

  async function update(status: 'approved' | 'rejected') {
    setLoading(status);
    const { error } = await supabase.rpc('admin_set_teacher_application_status', {
      p_teacher_profile_id: teacherId,
      p_status: status,
    });
    if (!error) {
      setDone(status);
      window.location.reload();
    }
    setLoading('');
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold capitalize text-emerald-700 dark:text-emerald-300">
        <Check className="h-3 w-3" />
        <span>{done}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void update('approved')}
        disabled={Boolean(loading)}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
      >
        {loading === 'approved' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        <span>Approve</span>
      </button>

      <button
        type="button"
        onClick={() => void update('rejected')}
        disabled={Boolean(loading)}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-60 cursor-pointer"
      >
        {loading === 'rejected' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
        <span>Reject</span>
      </button>
    </div>
  );
}

export function SuspensionButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function toggle() {
    setLoading(true);
    const reason = suspended
      ? null
      : window.prompt('Reason for account suspension:') ?? 'Administrative suspension';
    const { error } = await supabase.rpc('admin_set_account_suspension', {
      p_user_id: userId,
      p_suspended: !suspended,
      p_reason: reason,
    });
    if (!error) window.location.reload();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60 ${
        suspended
          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
          : 'border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : suspended ? (
        <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <ShieldAlert className="h-3 w-3 text-stone-400 group-hover:text-red-500" />
      )}
      <span>{suspended ? 'Restore Access' : 'Suspend Account'}</span>
    </button>
  );
}
