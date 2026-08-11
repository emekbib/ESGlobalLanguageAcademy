'use client';

import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
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
    <div className="rounded-3xl border bg-background p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Teacher payouts</p>
          <h2 className="mt-2 text-2xl font-bold">{connected ? 'Payout account connected' : 'Set up your payout account'}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Connect a Stripe Express account to receive 80% of each lesson after you mark it completed. The academy keeps a 20% platform commission.</p>
        </div>
        {connected ? <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" /> : <CreditCard className="h-8 w-8 shrink-0 text-primary" />}
      </div>
      {!connected && <button type="button" onClick={startOnboarding} disabled={loading} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105 disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Opening Stripe…' : 'Connect Stripe Express'}</button>}
      {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
