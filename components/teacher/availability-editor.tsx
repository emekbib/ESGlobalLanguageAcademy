'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2, Plus, Trash2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { weekdayName } from '@/lib/availability/slots';
import type { TeacherAvailability } from '@/lib/types/database';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

const COMMON_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Madrid', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
  'Australia/Sydney', 'UTC',
];

type DraftWindow = { weekday: number; start_time: string; end_time: string };

export default function AvailabilityEditor({ teacherId }: { teacherId: string }) {
  const supabase = createSupabaseBrowserClient();
  const [timezone, setTimezone] = useState('');
  const [windows, setWindows] = useState<TeacherAvailability[]>([]);
  const [draft, setDraft] = useState<DraftWindow>({ weekday: 1, start_time: '09:00', end_time: '17:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data } = await supabase.from('teacher_availability').select('*').eq('teacher_id', teacherId).order('weekday', { ascending: true });
      if (!active) return;
      setWindows(data ?? []);
      const existingTz = data?.[0]?.timezone;
      setTimezone(existingTz || browserTz || 'UTC');
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [supabase, teacherId]);

  async function addWindow() {
    setError('');
    if (teacherId === 'admin-preview-id') {
      setError('Cannot edit availability in admin preview mode.');
      return;
    }
    if (draft.end_time <= draft.start_time) { setError('End time must be after start time.'); return; }
    setSaving(true);
    const { data, error: insertError } = await supabase.from('teacher_availability').insert({
      teacher_id: teacherId,
      weekday: draft.weekday,
      start_time: draft.start_time,
      end_time: draft.end_time,
      timezone,
    }).select().single();
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    if (data) setWindows((prev) => [...prev, data].sort((a, b) => a.weekday - b.weekday));
    setMessage('Availability window added.');
  }

  async function deleteWindow(id: string) {
    setError('');
    if (teacherId === 'admin-preview-id') {
      setError('Cannot edit availability in admin preview mode.');
      return;
    }
    setSaving(true);
    const { error: deleteError } = await supabase.from('teacher_availability').delete().eq('id', id);
    setSaving(false);
    if (deleteError) { setError(deleteError.message); return; }
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setMessage('Availability window removed.');
  }

  async function updateTimezone(newTz: string) {
    setTimezone(newTz);
    if (teacherId === 'admin-preview-id') {
      setError('Cannot edit timezone in admin preview mode.');
      return;
    }
    if (windows.length === 0) return;
    setSaving(true);
    const { error: updateError } = await supabase.from('teacher_availability').update({ timezone: newTz }).eq('teacher_id', teacherId);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setWindows((prev) => prev.map((w) => ({ ...w, timezone: newTz })));
    setMessage('Timezone updated for all windows.');
  }

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  const grouped = WEEKDAYS.map((day) => ({ day, items: windows.filter((w) => w.weekday === day) })).filter((g) => g.items.length > 0);

  return (
    <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300 ring-1 ring-amber-500/20 shadow-sm">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">Weekly Availability</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Set recurring time windows in your timezone. Students see them converted to their own timezone.</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400" htmlFor="tz">Your Teaching Timezone</label>
        <select id="tz" value={timezone} onChange={(e) => void updateTimezone(e.target.value)} disabled={saving} className="mt-2 h-11 sm:h-12 w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/60 px-4 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white outline-none transition focus:border-stone-400 dark:focus:border-stone-600">
          {(COMMON_TIMEZONES.includes(timezone) ? [timezone, ...COMMON_TIMEZONES.filter((t) => t !== timezone)] : [timezone, ...COMMON_TIMEZONES]).map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
        <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">All session times below are calculated in {timezone}.</p>
      </div>

      {grouped.length > 0 && (
        <div className="mt-8 space-y-5">
          {grouped.map(({ day, items }) => (
            <div key={day}>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">{weekdayName(day)}</p>
              <div className="mt-2 space-y-2">
                {items.map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 px-4 py-3">
                    <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">{w.start_time} — {w.end_time}</span>
                    <button type="button" onClick={() => void deleteWindow(w.id)} disabled={saving} className="rounded-xl p-1.5 text-stone-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition disabled:opacity-50" title="Delete slot"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 sm:p-6">
        <p className="font-display text-sm font-bold text-stone-950 dark:text-white">Add New Availability Window</p>
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400" htmlFor="weekday">Day of Week</label>
            <select id="weekday" value={draft.weekday} onChange={(e) => setDraft({ ...draft, weekday: Number(e.target.value) })} className="mt-1.5 h-11 sm:h-12 w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800 px-3.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white outline-none focus:border-stone-400">
              {WEEKDAYS.map((d) => <option key={d} value={d}>{weekdayName(d)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400" htmlFor="start">Start Time</label>
            <input id="start" type="time" value={draft.start_time} onChange={(e) => setDraft({ ...draft, start_time: e.target.value })} className="mt-1.5 h-11 sm:h-12 w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800 px-3.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400" htmlFor="end">End Time</label>
            <input id="end" type="time" value={draft.end_time} onChange={(e) => setDraft({ ...draft, end_time: e.target.value })} className="mt-1.5 h-11 sm:h-12 w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800 px-3.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white outline-none focus:border-stone-400" />
          </div>
        </div>
        <button type="button" onClick={() => void addWindow()} disabled={saving} className="mt-5 inline-flex w-full sm:w-auto h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-stone-950 dark:bg-stone-100 px-6 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white disabled:opacity-60 active:scale-95">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add Availability Window
        </button>
      </div>

      {error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-700 dark:text-rose-400">{error}</p>}
      {message && <p className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">{message}</p>}
    </div>
  );
}
