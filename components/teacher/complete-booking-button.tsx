'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function CompleteBookingButton({ bookingId }: { bookingId: string }) {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function completeBooking() {
    setLoading(true);
    setError('');
    const { data, error: functionError } = await supabase.functions.invoke('complete-booking', { body: { bookingId } });
    if (functionError || !data?.completed) {
      setError('We couldn’t complete this lesson yet.');
      setLoading(false);
      return;
    }
    setDone(true);
  }

  if (done) return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Completed and paid out</span>;
  return <div className="flex flex-col items-end gap-2"><button type="button" onClick={completeBooking} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-60">{loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{loading ? 'Processing…' : 'Mark completed'}</button>{error && <span className="text-right text-xs text-destructive">{error}</span>}</div>;
}
