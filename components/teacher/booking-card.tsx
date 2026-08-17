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
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { generateSlots } from '@/lib/availability/slots';
import type { TeacherAvailability } from '@/lib/types/database';
import type { Booking as SlotBooking } from '@/lib/availability/slots';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    let active = true;
    async function load() {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      if (active) setViewerTz(browserTz);

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
        setAvailability(avail ?? []);
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
    return Math.round((hourly * lessonMinutes) / 60 * 100) / 100;
  }, [hourlyRate, lessonMinutes]);

  const bookingHref = useMemo(() => {
    if (!selectedSlot) return `/booking/${teacherId}`;
    const params = new URLSearchParams({
      start: selectedSlot.startUtc,
      end: selectedSlot.endUtc,
      duration: String(lessonMinutes),
    });
    return `/booking/${teacherId}?${params.toString()}`;
  }, [selectedSlot, lessonMinutes, teacherId]);

  const canGoBack = dayOffset > 0;
  const canGoForward = dayOffset + DAYS_PER_PAGE < grouped.length;

  const handleLessonChange = useCallback((minutes: number) => {
    setLessonMinutes(minutes);
    setSelectedSlot(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-6 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading availability…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">We couldn&apos;t load availability. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Price */}
      <div className="border-b bg-gradient-to-br from-primary/5 to-accent/5 p-5">
        <p className="text-sm text-muted-foreground">From</p>
        <p className="font-display text-3xl font-bold text-primary">
          ${pricePerLesson}
          <span className="text-base font-medium text-muted-foreground"> / {lessonMinutes} min</span>
        </p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {/* Lesson length selector */}
        <div>
          <p className="mb-2 text-sm font-semibold">Lesson length</p>
          <div className="flex gap-2">
            {LESSON_LENGTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleLessonChange(m)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  lessonMinutes === m
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/50'
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
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-primary" />
              Availability
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDayOffset((o) => Math.max(0, o - DAYS_PER_PAGE))}
                disabled={!canGoBack}
                className="rounded-md border p-1 transition-colors hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDayOffset((o) => o + DAYS_PER_PAGE)}
                disabled={!canGoForward}
                className="rounded-md border p-1 transition-colors hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {slots.length === 0 ? (
            <div className="rounded-xl border bg-muted/30 px-4 py-6 text-center">
              <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">
                No availability set yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleDays.map(({ day, slots: daySlots }) => (
                <div key={day}>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{day}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {daySlots.map((slot) => {
                      const isSelected =
                        selectedSlot?.startUtc === slot.startUtc;
                      return (
                        <button
                          key={slot.startUtc}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
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
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full">
            <Link href={bookingHref}>Book a lesson</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/dashboard">
              <MessageCircle className="mr-2 h-4 w-4" />
              Message teacher
            </Link>
          </Button>
        </div>

        {selectedSlot && (
          <p className="text-center text-xs text-muted-foreground">
            Selected: {selectedSlot.dayLocal}, {selectedSlot.startLocal} – {selectedSlot.endLocal}
          </p>
        )}
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
