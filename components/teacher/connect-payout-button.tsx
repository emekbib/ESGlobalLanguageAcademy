'use client';

import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ConnectPayoutButton({ connected }: { connected: boolean }) {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startOnboarding() {
    setLoading(true);
    setError('');
    const { data, error: functionError } = await supabase.functions.invoke('create-connect-account', { body: {} });
    if (functionError || !data || typeof data.onboardingUrl !== 'string') {
      setError('We couldn’t open payout setup. Please try again.');
      setLoading(false);
      return;
    }
    window.location.assign(data.onboardingUrl);
  }

  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Escrow &amp; Banking
          </span>
          <h2 className="mt-1 font-display text-xl font-bold text-stone-950">
            {connected ? 'Payout Account Active' : 'Set Up Direct Stripe Payouts'}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-stone-500 font-medium">
            Connect your bank account via Stripe Express to receive direct payouts after each 1-on-1 session is completed.
          </p>
        </div>
        <div className="shrink-0 self-start">
          {connected ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <CreditCard className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>

      {!connected && (
        <button
          type="button"
          onClick={startOnboarding}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{loading ? 'Opening Stripe…' : 'Connect Stripe Express'}</span>
          <ArrowRight className="h-3.5 w-3.5 text-amber-300" />
        </button>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
