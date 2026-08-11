'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Booking, BookingStatus } from '@/lib/types/database';
import CompleteBookingButton from '@/components/teacher/complete-booking-button';

type EnrichedBooking = Pick<Booking, 'id' | 'teacher_id' | 'student_id' | 'start_time_utc' | 'end_time_utc' | 'status'> & { teacher_name: string; teacher_avatar: string | null };

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatLocal(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return {
    date: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }).format(d),
    time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(d),
  };
}

export default function BookingsList({
  bookings,
  title,
  emptyMessage,
  viewerRole,
}: {
  bookings: EnrichedBooking[];
  title: string;
  emptyMessage: string;
  viewerRole: 'student' | 'teacher';
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold">{title}</h2>
      {bookings.length === 0 ? (
        <div className="mt-4 rounded-2xl border bg-muted/30 px-6 py-10 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => {
            const start = formatLocal(booking.start_time_utc);
            const end = formatLocal(booking.end_time_utc);
            const otherParty = viewerRole === 'student' ? booking.teacher_name : 'Student';
            return (
              <div key={booking.id} className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-5 py-4 shadow-sm">
                <Link href={`/booking/${booking.id}`} className="flex min-w-0 flex-1 items-center gap-4 transition hover:text-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{start.date}</p>
                    <p className="text-sm text-muted-foreground">{start.time} – {end.time}</p>
                    <p className="text-xs text-muted-foreground">with {otherParty}</p>
                  </div>
                </Link>
                <div className="flex flex-col items-end gap-2">
                  <Link href={`/booking/${booking.id}`} className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
                    {booking.status}
                  </Link>
                  {viewerRole === 'student' && booking.status === 'completed' && <Link href={`/booking/${booking.id}#review`} className="text-xs font-semibold text-primary hover:underline">Leave a review</Link>}
                  {viewerRole === 'teacher' && booking.status === 'confirmed' && <CompleteBookingButton bookingId={booking.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
