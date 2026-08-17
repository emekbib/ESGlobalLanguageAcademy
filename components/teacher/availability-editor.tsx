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
    setSaving(true);
    const { error: deleteError } = await supabase.from('teacher_availability').delete().eq('id', id);
    setSaving(false);
    if (deleteError) { setError(deleteError.message); return; }
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setMessage('Availability window removed.');
  }

  async function updateTimezone(newTz: string) {
    setTimezone(newTz);
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
    <div className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock className="h-5 w-5" /></div>
        <div>
          <h2 className="text-xl font-bold">Weekly availability</h2>
          <p className="text-sm text-muted-foreground">Set recurring time windows in your local timezone. Students see them in their own timezone.</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium" htmlFor="tz">Your timezone</label>
        <select id="tz" value={timezone} onChange={(e) => void updateTimezone(e.target.value)} disabled={saving} className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
          {(COMMON_TIMEZONES.includes(timezone) ? [timezone, ...COMMON_TIMEZONES.filter((t) => t !== timezone)] : [timezone, ...COMMON_TIMEZONES]).map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">All times below are in {timezone}.</p>
      </div>

      {grouped.length > 0 && (
        <div className="mt-8 space-y-5">
          {grouped.map(({ day, items }) => (
            <div key={day}>
              <p className="text-sm font-semibold text-muted-foreground">{weekdayName(day)}</p>
              <div className="mt-2 space-y-2">
                {items.map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                    <span className="text-sm font-medium">{w.start_time} — {w.end_time}</span>
                    <button type="button" onClick={() => void deleteWindow(w.id)} disabled={saving} className="text-muted-foreground transition hover:text-destructive disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border bg-muted/20 p-5">
        <p className="text-sm font-semibold">Add a new window</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground" htmlFor="weekday">Day</label>
            <select id="weekday" value={draft.weekday} onChange={(e) => setDraft({ ...draft, weekday: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              {WEEKDAYS.map((d) => <option key={d} value={d}>{weekdayName(d)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground" htmlFor="start">Start time</label>
            <input id="start" type="time" value={draft.start_time} onChange={(e) => setDraft({ ...draft, start_time: e.target.value })} className="mt-1 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground" htmlFor="end">End time</label>
            <input id="end" type="time" value={draft.end_time} onChange={(e) => setDraft({ ...draft, end_time: e.target.value })} className="mt-1 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <button type="button" onClick={() => void addWindow()} disabled={saving} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add window
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
    </div>
  );
}
