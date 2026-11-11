'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { generateSlots, formatDateKey, type AvailabilitySlot } from '@/lib/availability/slots';
import type { TeacherAvailability, TeacherType } from '@/lib/types/database';
import Link from 'next/link';

const DAYS_PER_PAGE = 3;

type SlotBooking = {
  startUtc: string;
  endUtc: string;
};

type BookingCardProps = {
  teacherId: string;
  hourlyRate: number;
  teacherType?: TeacherType;
  teacherName?: string;
  teacherAvatar?: string | null;
};

export default function BookingCard({
  teacherId,
  hourlyRate,
  teacherType = 'community_tutor',
  teacherName = 'Native Educator',
  teacherAvatar = null,
}: BookingCardProps) {
  const supabase = createSupabaseBrowserClient();
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [existingBookings, setExistingBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [lessonMinutes, setLessonMinutes] = useState(50);
  const [selectedTrack, setSelectedTrack] = useState<'track_1' | 'track_2'>('track_1');
  const [viewerTz, setViewerTz] = useState('UTC');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
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
          start_time: '09:00:00',
          end_time: '17:00:00',
          timezone: browserTz,
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

      // Resolve teacher_id: query both teacher_profiles.id and profiles.user_id
      let queryIds = [teacherId];
      const { data: tp } = await supabase
        .from('teacher_profiles')
        .select('id, user_id')
        .or(`id.eq.${teacherId},user_id.eq.${teacherId}`)
        .maybeSingle();

      if (tp) {
        queryIds = Array.from(new Set([tp.id, tp.user_id, teacherId]));
      }

      // Fetch availability from server API first for optimal reliability
      let avail: any[] | null = null;
      try {
        const apiRes = await fetch(`/api/teacher/availability?teacherId=${encodeURIComponent(teacherId)}`);
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (Array.isArray(apiJson?.data)) {
            avail = apiJson.data;
          }
        }
      } catch (e) {
        console.warn('Availability API fetch notice:', e);
      }

      if (!avail) {
        const { data: directAvail, error: availError } = await supabase
          .from('teacher_availability')
          .select('*')
          .in('teacher_id', queryIds);

        if (availError) {
          console.warn('Availability query notice:', availError.message);
        }
        avail = directAvail ?? [];
      }

      const { data: bks, error: bksError } = await supabase
        .from('bookings')
        .select('start_time_utc, end_time_utc, status, hold_expires_at')
        .in('teacher_id', queryIds)
        .in('status', ['pending', 'confirmed']);

      if (bksError) {
        console.warn('Bookings query notice:', bksError.message);
      }

      const now = Date.now();
      const activeBookings = (bks ?? []).filter(
        (b) =>
          b.status === 'confirmed' ||
          (b.hold_expires_at && new Date(b.hold_expires_at).getTime() > now),
      );

      if (active) {
        // Fallback default working windows if teacher has not added custom hours yet
        const effectiveAvail =
          avail && avail.length > 0
            ? avail
            : [1, 2, 3, 4, 5].map((d) => ({
                id: `default-${d}`,
                teacher_id: teacherId,
                weekday: d,
                start_time: '09:00:00',
                end_time: '17:00:00',
                timezone: browserTz,
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

  const grouped = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const list = map.get(slot.dateKey);
      if (list) list.push(slot);
      else map.set(slot.dateKey, [slot]);
    }

    const result: { day: string; dateKey: string; slots: AvailabilitySlot[] }[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dayLabel = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: viewerTz || 'UTC',
      });
      const dKey = formatDateKey(d, viewerTz || 'UTC');

      result.push({
        day: dayLabel,
        dateKey: dKey,
        slots: map.get(dKey) ?? [],
      });
    }

    return result;
  }, [slots, viewerTz]);

  const visibleDays = grouped.slice(dayOffset, dayOffset + DAYS_PER_PAGE);

  const pricePerLesson = useMemo(() => {
    const hourly = Number(hourlyRate) || 35;
    const mins = Number(lessonMinutes) || 50;
    if (mins === 50) return hourly;
    return Math.round(((hourly * mins) / 50) * 100) / 100;
  }, [hourlyRate, lessonMinutes]);

  const canGoBack = dayOffset > 0;
  const canGoForward = dayOffset + DAYS_PER_PAGE < grouped.length;

  const handleLessonChange = useCallback((minutes: number) => {
    setLessonMinutes(minutes);
    setSelectedSlot(null);
  }, []);

  const handleOpenConfirmModal = () => {
    setBookingError(null);
    const slotToBook = selectedSlot || slots[0];
    if (!slotToBook) {
      setBookingError('Please choose an available time slot from the calendar.');
      return;
    }
    if (!selectedSlot && slots[0]) {
      setSelectedSlot(slots[0]);
    }
    setConfirmModalOpen(true);
  };

  const handleProceedToPayment = async () => {
    setBookingError(null);
    const slotToBook = selectedSlot || slots[0];
    if (!slotToBook) {
      setBookingError('Please choose an available time slot from the calendar.');
      setConfirmModalOpen(false);
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
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          teacherId,
          startUtc: slotToBook.startUtc,
          endUtc: slotToBook.endUtc,
          track: selectedTrack,
          lessonMinutes,
          quotedPrice: pricePerLesson,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data || typeof data.checkoutUrl !== 'string') {
        setBookingError(
          data?.error || 'Could not start checkout session. Please try another time slot.',
        );
        setBookingInProgress(false);
        setConfirmModalOpen(false);
        return;
      }

      if (data.booking) {
        try {
          const storageKey = `es_student_bookings_${user.id}`;
          const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
          const existingList: any[] = raw ? JSON.parse(raw) : [];
          const filtered = existingList.filter((b: any) => b.id !== data.booking.id);
          filtered.push(data.booking);
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(filtered));
          }
        } catch {}
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      setBookingError('An unexpected error occurred while starting checkout.');
      setBookingInProgress(false);
      setConfirmModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-stone-500 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-stone-900 dark:text-stone-100" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Checking calendar availability…
        </span>
      </div>
    );
  }

  const activeSlot = selectedSlot || slots[0];

  return (
    <>
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

        <div className="space-y-6 p-6 sm:p-7">
          {/* Duration Selector */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Session Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 50, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleLessonChange(mins)}
                  className={`rounded-2xl border py-2.5 text-xs font-bold transition-all ${
                    lessonMinutes === mins
                      ? 'border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Availability Calendar */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Next Open Slots ({viewerTz.replace(/_/g, ' ')})
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
                    {daySlots.length > 0 ? (
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
                    ) : (
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 italic">No open slots</p>
                    )}
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
              onClick={handleOpenConfirmModal}
              disabled={bookingInProgress || slots.length === 0}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-stone-950 dark:bg-stone-100 py-3.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {bookingInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing Checkout…
                </>
              ) : slots.length === 0 ? (
                <span>No Open Slots Scheduled</span>
              ) : (
                <>
                  <span>{selectedSlot ? 'Review & Book Slot' : 'Instant Book Lesson'}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 dark:bg-stone-950/20 text-amber-300 dark:text-stone-950 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </>
              )}
            </button>

            <Link
              href={teacherId ? `/dashboard?tab=messages&contactId=${teacherId}` : '/dashboard?tab=messages'}
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

      {/* VISIBLE PAYMENT CONFIRMATION STEP MODAL */}
      {confirmModalOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 shadow-2xl text-stone-950 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-stone-150 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-5 w-5 text-amber-500" />
                <h3 className="font-display text-lg font-bold">Confirm Lesson Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-4 border border-stone-200/60 dark:border-stone-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-500 dark:text-stone-400">Educator</span>
                  <span className="font-bold text-stone-900 dark:text-white">{teacherName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-500 dark:text-stone-400">Date & Time</span>
                  <span className="font-bold text-stone-900 dark:text-white">
                    {activeSlot.dayLocal} at {activeSlot.startLocal} ({viewerTz.replace(/_/g, ' ')})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-500 dark:text-stone-400">Duration</span>
                  <span className="font-bold text-stone-900 dark:text-white">{lessonMinutes} minutes</span>
                </div>
                <div className="border-t border-stone-200 dark:border-stone-700 pt-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Total Quoted Price
                  </span>
                  <span className="font-display text-xl font-black text-stone-950 dark:text-white">
                    ${pricePerLesson.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Your card is only charged upon reservation confirmation. Free cancellation up to 24h prior.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="w-full sm:w-auto flex-1 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition"
              >
                Change Slot
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={bookingInProgress}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white shadow-md transition disabled:opacity-60"
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting to Stripe…
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay (${pricePerLesson.toFixed(2)})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
