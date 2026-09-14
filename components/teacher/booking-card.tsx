'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { generateSlots } from '@/lib/availability/slots';
import type { TeacherAvailability } from '@/lib/types/database';
import type { Booking as SlotBooking } from '@/lib/availability/slots';

const LESSON_LENGTHS = [30, 45, 60];
const DAYS_PER_PAGE = 5;

type BookingCardProps = {
  teacherId: string;
  hourlyRate: number;
};

type Slot = ReturnType<typeof generateSlots>[number];

export default function BookingCard({ teacherId, hourlyRate }: BookingCardProps) {
  const supabase = createSupabaseBrowserClient();
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [existingBookings, setExistingBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [lessonMinutes, setLessonMinutes] = useState(60);
  const [viewerTz, setViewerTz] = useState('UTC');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function load() {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      if (active) setViewerTz(browserTz);

      if (teacherId.startsWith('sample-')) {
        const sampleAvail: TeacherAvailability[] = [1, 2, 3, 4, 5].map((day) => ({
          id: `avail-${day}`,
          teacher_id: teacherId,
          weekday: day,
          start_time: '09:00',
          end_time: '17:00',
          timezone: 'UTC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        if (active) {
          setAvailability(sampleAvail);
          setExistingBookings([]);
          setLoading(false);
        }
        return;
      }

      const { data: avail, error: availError } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId);
      if (availError) {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
        return;
      }

      const { data: bks, error: bksError } = await supabase
        .from('bookings')
        .select('start_time_utc, end_time_utc, status, hold_expires_at')
        .eq('teacher_id', teacherId)
        .in('status', ['pending', 'confirmed']);
      if (bksError) {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
        return;
      }

      const now = Date.now();
      const activeBookings = (bks ?? []).filter(
        (b) =>
          b.status === 'confirmed' ||
          (b.hold_expires_at && new Date(b.hold_expires_at).getTime() > now),
      );
      if (active) {
        const effectiveAvail =
          avail && avail.length > 0
            ? avail
            : [1, 2, 3, 4, 5].map((day) => ({
                id: `default-${day}`,
                teacher_id: teacherId,
                weekday: day,
                start_time: '09:00',
                end_time: '18:00',
                timezone: browserTz || 'UTC',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }));

        setAvailability(effectiveAvail);
        setExistingBookings(
          activeBookings.map((b) => ({ startUtc: b.start_time_utc, endUtc: b.end_time_utc })),
        );
        setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [supabase, teacherId]);

  const slots = useMemo(
    () => generateSlots(availability, viewerTz, lessonMinutes, 14, existingBookings),
    [availability, viewerTz, lessonMinutes, existingBookings],
  );

  const grouped = useMemo(() => groupByDay(slots), [slots]);
  const visibleDays = grouped.slice(dayOffset, dayOffset + DAYS_PER_PAGE);

  const pricePerLesson = useMemo(() => {
    const hourly = Number(hourlyRate);
    return Math.round(((hourly * lessonMinutes) / 60) * 100) / 100;
  }, [hourlyRate, lessonMinutes]);

  const canGoBack = dayOffset > 0;
  const canGoForward = dayOffset + DAYS_PER_PAGE < grouped.length;

  const handleLessonChange = useCallback((minutes: number) => {
    setLessonMinutes(minutes);
    setSelectedSlot(null);
  }, []);

  const handleBookSlot = async () => {
    setBookingError(null);
    const slotToBook = selectedSlot || slots[0];
    if (!slotToBook) {
      setBookingError('Please choose an available time slot from the calendar.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth`);
      return;
    }

    setBookingInProgress(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          teacherId,
          startUtc: slotToBook.startUtc,
          endUtc: slotToBook.endUtc,
        },
      });

      if (error || !data || typeof data.checkoutUrl !== 'string') {
        setBookingError(
          data?.error || 'Could not start checkout session. Please try another time slot.',
        );
        setBookingInProgress(false);
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      setBookingError('An unexpected error occurred while starting checkout.');
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-stone-200 bg-white p-6 text-stone-500 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-stone-900" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Checking calendar availability…
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50/50 p-6 text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">We couldn&apos;t load availability. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Price Header (Intro.co style) */}
      <div className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/60 p-6 sm:p-7">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Lesson Investment
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-stone-950 dark:text-white">
            ${pricePerLesson}
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">/ {lessonMinutes} min session</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:p-7">
        {/* Lesson duration selector */}
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Session Length
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LESSON_LENGTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleLessonChange(m)}
                className={`rounded-2xl border py-2.5 text-center text-xs font-bold transition-all ${
                  lessonMinutes === m
                    ? 'border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Mini calendar */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <CalendarDays className="h-4 w-4 text-stone-700 dark:text-stone-300" />
              Available Schedule
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDayOffset((o) => Math.max(0, o - DAYS_PER_PAGE))}
                disabled={!canGoBack}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-30"
                aria-label="Previous days"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDayOffset((o) => o + DAYS_PER_PAGE)}
                disabled={!canGoForward}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-30"
                aria-label="Next days"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {slots.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 py-6 text-center">
              <Clock className="mx-auto h-5 w-5 text-stone-400" />
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                No open slots found for these dates.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {visibleDays.map(({ day, slots: daySlots }) => (
                <div key={day}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {day}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {daySlots.map((slot) => {
                      const isSelected = selectedSlot?.startUtc === slot.startUtc;
                      return (
                        <button
                          key={slot.startUtc}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700'
                          }`}
                        >
                          {slot.startLocal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          {bookingError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {bookingError}
            </div>
          )}

          <button
            type="button"
            onClick={handleBookSlot}
            disabled={bookingInProgress}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-stone-950 dark:bg-stone-100 py-3.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 disabled:opacity-60"
          >
            {bookingInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing Checkout…
              </>
            ) : (
              <>
                <span>{selectedSlot ? 'Book Selected Slot' : 'Instant Book Lesson'}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 dark:bg-stone-950/20 text-amber-300 dark:text-stone-950 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </>
            )}
          </button>

          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 transition hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            <MessageCircle className="h-3.5 w-3.5 text-stone-400" />
            Message Teacher
          </Link>
        </div>

        <div className="border-t border-stone-150 dark:border-stone-800 pt-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            100% Escrow Protection · Instant Confirmation
          </p>
        </div>
      </div>
    </div>
  );
}

function groupByDay(slots: Slot[]): { day: string; slots: Slot[] }[] {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const list = map.get(slot.dayLocal);
    if (list) list.push(slot);
    else map.set(slot.dayLocal, [slot]);
  }
  return Array.from(map.entries()).map(([day, daySlots]) => ({ day, slots: daySlots }));
}
