'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { Booking, BookingStatus } from '@/lib/types/database';
import CompleteBookingButton from '@/components/teacher/complete-booking-button';

type EnrichedBooking = Pick<Booking, 'id' | 'teacher_id' | 'student_id' | 'start_time_utc' | 'end_time_utc' | 'status'> & { teacher_name: string; teacher_avatar: string | null };

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  completed: 'bg-blue-50 text-[#2563eb] border border-blue-200/60',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200/60',
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
    <div className="mt-8">
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Lesson Schedule
        </span>
        <h2 className="font-display text-xl font-black tracking-tight text-slate-900">{title}</h2>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="mt-3 text-xs text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const start = formatLocal(booking.start_time_utc);
            const end = formatLocal(booking.end_time_utc);
            const otherParty = viewerRole === 'student' ? booking.teacher_name : 'Student';
            return (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
              >
                <Link
                  href={`/booking/${booking.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4 transition group"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-900 group-hover:text-[#2563eb] transition">
                      {start.date}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {start.time} – {end.time}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      with {otherParty}
                    </p>
                  </div>
                </Link>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/booking/${booking.id}`}
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[booking.status]}`}
                  >
                    {booking.status}
                  </Link>
                  {viewerRole === 'student' && booking.status === 'completed' && (
                    <Link
                      href={`/booking/${booking.id}#review`}
                      className="text-xs font-bold text-[#2563eb] hover:underline"
                    >
                      Leave a review
                    </Link>
                  )}
                  {viewerRole === 'teacher' && booking.status === 'confirmed' && (
                    <CompleteBookingButton bookingId={booking.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
