'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

type ConnectPayoutButtonProps = {
  connected: boolean;
};

export default function ConnectPayoutButton({ connected }: ConnectPayoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [canSimulate, setCanSimulate] = useState(false);

  async function startOnboarding() {
    setLoading(true);
    setError('');
    setCanSimulate(false);

    try {
      const res = await fetch('/api/teacher/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data) {
        setError(data?.error || 'We couldn’t open payout setup. Please try again.');
        if (data?.canSimulate || data?.permissionRequired) {
          setCanSimulate(true);
        }
        setLoading(false);
        return;
      }

      if (data.onboardingUrl) {
        window.location.assign(data.onboardingUrl);
      } else if (data.success) {
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'We couldn’t open payout setup. Please try again.');
      setCanSimulate(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    setSimulating(true);
    setError('');

    try {
      const res = await fetch('/api/teacher/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate' }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.refresh();
      } else {
        setError(data?.error || 'Failed to simulate connection.');
      }
    } catch (err: any) {
      setError(err?.message || 'Simulation failed.');
    } finally {
      setSimulating(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect your payout account for testing?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Escrow &amp; Banking
          </span>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-stone-950 dark:text-white">
            {connected ? 'Payout Account Active' : 'Set Up Direct Stripe Payouts'}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-stone-500 dark:text-stone-400 font-medium">
            {connected
              ? 'Your bank account is securely linked via Stripe Express. Earnings from each completed 1-on-1 language lesson are automatically transferred to your account.'
              : 'Connect your bank account via Stripe Express to receive direct payouts after each 1-on-1 session is completed.'}
          </p>
        </div>

        <div className="shrink-0 self-start">
          {connected ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 ring-1 ring-stone-200/80 dark:ring-stone-700 shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>

      {connected ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Direct Bank Transfers Enabled</span>
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3.5 py-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Connection</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startOnboarding}
            disabled={loading || simulating}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to Stripe…</span>
              </>
            ) : (
              <>
                <span>Connect Stripe Express</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-300 dark:text-stone-950" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={loading || simulating}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 dark:bg-amber-400/10 px-5 py-3 text-xs font-bold text-amber-800 dark:text-amber-300 transition hover:bg-amber-500/20 cursor-pointer"
            title="Simulate Stripe Connect for demo/testing without leaving the app"
          >
            {simulating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span>Simulate Connect (Demo Test)</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 p-4 text-xs font-medium text-red-800 dark:text-red-300 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
              {canSimulate && (
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Tip: Use the <strong className="text-stone-900 dark:text-white">“Simulate Connect (Demo Test)”</strong> button above to instantly activate payout status for demo and client presentation.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
