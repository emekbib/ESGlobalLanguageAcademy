'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Mail,
  Loader2,
  AlertCircle,
  Pencil,
  Save,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSameUser } from '@/lib/auth/same-user';

type WisePayoutFormProps = {
  teacherProfileId: string;
  userId: string;
  defaultEmail?: string | null;
  initialPayout?: {
    payout_email?: string | null;
  } | null;
};

export default function ConnectPayoutButton({
  teacherProfileId,
  userId,
  defaultEmail,
  initialPayout,
}: WisePayoutFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [payoutEmail, setPayoutEmail] = useState(
    initialPayout?.payout_email ?? defaultEmail ?? '',
  );
  const [hasSavedEmail, setHasSavedEmail] = useState(
    Boolean(initialPayout?.payout_email),
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const next = initialPayout?.payout_email ?? defaultEmail ?? '';
    setPayoutEmail(next);
    setHasSavedEmail(Boolean(initialPayout?.payout_email));
  }, [initialPayout, defaultEmail]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!payoutEmail.trim()) {
      setError('Please enter a payout email.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { user, error: identityError } = await getSameUser(supabase, userId);
      if (!user) {
        setError(identityError ?? 'Session expired. Please sign in again.');
        setSaving(false);
        return;
      }

      const { error: updateErr } = await supabase
        .from('teacher_profiles')
        .update({
          payout_email: payoutEmail.trim(),
        })
        .eq('id', teacherProfileId);

      if (updateErr) {
        setError(updateErr.message || 'Failed to save payout email.');
        setSaving(false);
        return;
      }

      setHasSavedEmail(true);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Earnings &amp; Payouts
          </span>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-stone-950 dark:text-white">
            Set Up Wise Payouts
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-stone-500 dark:text-stone-400 font-medium">
            You&apos;re paid monthly via Wise. Your payout goes to the email below — Wise will email you to claim it, and you enter your bank details on Wise&apos;s site.
          </p>
        </div>

        <div className="shrink-0 self-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 ring-1 ring-stone-200/80 dark:ring-stone-700 shadow-sm">
            <Mail className="h-5 w-5" />
          </div>
        </div>
      </div>

      {hasSavedEmail && !editing ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-400/10 px-4 py-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Payout email on file</span>
          </div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Payouts go to {payoutEmail}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Payout Email</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Payout Email
            </label>
            <input
              type="email"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 p-4 text-xs font-medium text-red-800 dark:text-red-300 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-400/10 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Payout email saved successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 text-amber-300 dark:text-stone-950" />
                <span>Save Payout Email</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
