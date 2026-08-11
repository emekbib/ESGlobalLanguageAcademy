'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { generateSlots } from '@/lib/availability/slots';
import type { Booking as SlotBooking } from '@/lib/availability/slots';
import type { TeacherAvailability } from '@/lib/types/database';

const LESSON_LENGTHS = [30, 45, 60, 90];

type BookingResult = { ok: boolean; message: string };

export default function AvailabilityDisplay({ teacherId }: { teacherId: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [existingBookings, setExistingBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonMinutes, setLessonMinutes] = useState(60);
  const [viewerTz, setViewerTz] = useState('UTC');
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [authed, setAuthed] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      if (active) setViewerTz(browserTz);
      const { data: { user } } = await supabase.auth.getUser();
      if (active) setAuthed(!!user);

      const { data: avail, error: availError } = await supabase.from('teacher_availability').select('*').eq('teacher_id', teacherId);
      if (availError) { if (active) { setLoadError(true); setLoading(false); } return; }
      const { data: bks, error: bksError } = await supabase
        .from('bookings')
        .select('start_time_utc, end_time_utc, status, hold_expires_at')
        .eq('teacher_id', teacherId)
        .in('status', ['pending', 'confirmed']);
      if (bksError) { if (active) { setLoadError(true); setLoading(false); } return; }

      const now = Date.now();
      const activeBookings = (bks ?? []).filter((booking) => booking.status === 'confirmed' || (booking.hold_expires_at && new Date(booking.hold_expires_at).getTime() > now));
      if (active) {
        setAvailability(avail ?? []);
        setExistingBookings(activeBookings.map((b) => ({ startUtc: b.start_time_utc, endUtc: b.end_time_utc })));
        setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [supabase, teacherId]);

  const slots = useMemo(() => generateSlots(availability, viewerTz, lessonMinutes, 14, existingBookings), [availability, viewerTz, lessonMinutes, existingBookings]);
  const grouped = useMemo(() => groupByDay(slots), [slots]);

  const handleBook = useCallback(async (startUtc: string, endUtc: string) => {
    setBookingSlot(startUtc);
    setBookingResult(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { teacherId, startUtc, endUtc },
    });

    setBookingSlot(null);

    if (error || !data || typeof data.checkoutUrl !== 'string') {
      setBookingResult({
        ok: false,
        message: 'That slot may no longer be available. Please choose another time and try again.',
      });
      return;
    }

    setBookingResult({ ok: true, message: 'Your slot is held for 15 minutes while you complete payment.' });
    window.location.assign(data.checkoutUrl);
  }, [supabase, teacherId, router]);

  if (loading) return <div className="flex items-center gap-3 py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading availability…</div>;
  if (loadError) return <div className="flex items-center gap-3 py-8 text-destructive"><AlertCircle className="h-5 w-5" /><p className="text-sm font-medium">We couldn\u2019t load availability. Please refresh.</p></div>;

  return (
    <div className="mt-10 border-t pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-bold">Available time slots</h2>
            <p className="text-sm text-muted-foreground">Next 14 days in your timezone ({viewerTz})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="lesson" className="text-sm font-medium text-muted-foreground">Lesson length</label>
          <select id="lesson" value={lessonMinutes} onChange={(e) => setLessonMinutes(Number(e.target.value))} className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            {LESSON_LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </div>
      </div>

      {!authed && slots.length > 0 && (
        <p className="mt-4 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">Sign in to book a lesson.</p>
      )}

      {bookingResult && (
        <div className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${bookingResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
          {bookingResult.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{bookingResult.message}</span>
        </div>
      )}

      {slots.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-muted/30 px-6 py-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">This teacher hasn&apos;t set any availability yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(({ day, slots: daySlots }) => (
            <div key={day}>
              <p className="text-sm font-semibold text-muted-foreground">{day}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot.startUtc}
                    type="button"
                    onClick={() => void handleBook(slot.startUtc, slot.endUtc)}
                    disabled={!authed || bookingSlot === slot.startUtc}
                    className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingSlot === slot.startUtc && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {slot.startLocal} – {slot.endLocal}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Slot = ReturnType<typeof generateSlots>[number];

function groupByDay(slots: Slot[]): { day: string; slots: Slot[] }[] {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const list = map.get(slot.dayLocal);
    if (list) list.push(slot);
    else map.set(slot.dayLocal, [slot]);
  }
  return Array.from(map.entries()).map(([day, daySlots]) => ({ day, slots: daySlots }));
}
