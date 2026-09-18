'use client';

import { useState } from 'react';
import { Loader2, Check, X, ShieldAlert, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
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

export function RoleDropdown({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  async function performUpdate(newRole: string) {
    setLoading(true);
    const { error } = await supabase.rpc('admin_set_user_role', {
      p_user_id: userId,
      p_role: newRole,
    });
    
    if (!error) {
      window.location.reload();
    } else {
      console.error(error);
      alert('Failed to update role. Make sure the database migration was run.');
      setLoading(false);
      setPendingRole(null);
    }
  }

  async function handleChange(newRole: string) {
    if (newRole === currentRole) return;
    
    // Prevent self-demotion
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId && newRole !== 'admin') {
      alert("You cannot remove your own admin privileges.");
      return;
    }
    
    if (newRole === 'admin') {
      setPendingRole('admin');
      return;
    }

    await performUpdate(newRole);
  }

  return (
    <>
      <select
        value={currentRole}
        onChange={(e) => void handleChange(e.target.value)}
        disabled={loading}
        className="ml-2 mt-1 block w-32 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-2 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-sm focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:opacity-50"
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>

      {pendingRole === 'admin' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl transition-all">
            <button
              type="button"
              onClick={() => setPendingRole(null)}
              disabled={loading}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 ring-4 ring-amber-50/50 dark:ring-amber-950/30">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-white">
                  Grant Admin Privileges?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Security confirmation</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to grant full Administrator privileges to this user? They will have complete access to the Operations Console.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingRole(null)}
                disabled={loading}
                className="rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void performUpdate('admin')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Granting Access…' : 'Yes, Grant Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const supabase = createSupabaseBrowserClient();

  async function performSuspension(finalReason: string | null) {
    setLoading(true);
    const { error } = await supabase.rpc('admin_set_account_suspension', {
      p_user_id: userId,
      p_suspended: !suspended,
      p_reason: finalReason,
    });
    if (!error) window.location.reload();
    setLoading(false);
    setShowModal(false);
  }

  function handleToggleClick() {
    if (suspended) {
      // Unsuspend doesn't need a reason
      void performSuspension(null);
    } else {
      // Open modal to get reason for suspension
      setReason('');
      setShowModal(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleToggleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60 ${
          suspended
            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
            : 'border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300'
        }`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : suspended ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <ShieldAlert className="h-3.5 w-3.5" />
        )}
        <span>{suspended ? 'Unsuspend' : 'Suspend'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl transition-all">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 ring-4 ring-red-50/50 dark:ring-red-950/30">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-white">
                  Suspend Account
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Administrative action</p>
              </div>
            </div>
            
            <div className="mt-5 space-y-3">
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Please provide a reason for suspending this user account. This will be recorded for audit purposes.
              </p>
              
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Violation of terms of service"
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/50 px-4 py-2.5 text-sm font-medium text-stone-900 dark:text-white placeholder-stone-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 dark:focus:border-red-600 dark:focus:ring-red-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void performSuspension(reason || 'Administrative suspension');
                }}
              />
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void performSuspension(reason || 'Administrative suspension')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Suspending…' : 'Suspend User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ReviewModerationActions({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState<'dismiss' | 'delete' | ''>('');
  const [done, setDone] = useState('');

  async function handleAction(action: 'dismiss' | 'delete') {
    if (action === 'delete') {
      const confirmed = window.confirm('Are you sure you want to permanently delete this review?');
      if (!confirmed) return;
    }

    setLoading(action);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });

      if (res.ok) {
        setDone(action === 'dismiss' ? 'Flag Dismissed' : 'Review Deleted');
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to moderate review.');
      }
    } catch {
      alert('Network error while processing review moderation.');
    } finally {
      setLoading('');
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        <span>{done}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void handleAction('dismiss')}
        disabled={Boolean(loading)}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-stone-750 disabled:opacity-60 cursor-pointer shadow-sm"
      >
        {loading === 'dismiss' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        )}
        <span>Dismiss Flag</span>
      </button>

      <button
        type="button"
        onClick={() => void handleAction('delete')}
        disabled={Boolean(loading)}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-60 cursor-pointer shadow-sm"
      >
        {loading === 'delete' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        <span>Remove</span>
      </button>
    </div>
  );
}

