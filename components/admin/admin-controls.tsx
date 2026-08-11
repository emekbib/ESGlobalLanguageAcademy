'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function ApplicationActions({ teacherId }: { teacherId: string }) {
  const [loading, setLoading] = useState('');
  const [done, setDone] = useState('');
  const supabase = createSupabaseBrowserClient();
  async function update(status: 'approved' | 'rejected') {
    setLoading(status);
    const { error } = await supabase.rpc('admin_set_teacher_application_status', { p_teacher_profile_id: teacherId, p_status: status });
    if (!error) { setDone(status); window.location.reload(); }
    setLoading('');
  }
  if (done) return <span className="text-xs font-semibold capitalize text-emerald-700">{done}</span>;
  return <div className="flex gap-2"><button type="button" onClick={() => void update('approved')} disabled={Boolean(loading)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{loading === 'approved' && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}Approve</button><button type="button" onClick={() => void update('rejected')} disabled={Boolean(loading)} className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-60">{loading === 'rejected' && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}Reject</button></div>;
}

export function SuspensionButton({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();
  async function toggle() {
    setLoading(true);
    const reason = suspended ? null : window.prompt('Reason for suspension') ?? 'Administrative suspension';
    const { error } = await supabase.rpc('admin_set_account_suspension', { p_user_id: userId, p_suspended: !suspended, p_reason: reason });
    if (!error) window.location.reload();
    setLoading(false);
  }
  return <button type="button" onClick={() => void toggle()} disabled={loading} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60 ${suspended ? 'border border-emerald-200 text-emerald-700' : 'border border-destructive/30 text-destructive'}`}>{loading && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}{suspended ? 'Restore' : 'Suspend'}</button>;
}
