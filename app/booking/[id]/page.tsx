import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, GraduationCap, ShieldCheck, User } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import DailyCall from '@/components/booking/daily-call';
import ReviewForm from '@/components/reviews/review-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, student_id, teacher_id, start_time_utc, end_time_utc, status, daily_room_url')
    .eq('id', id)
    .maybeSingle();

  if (
    error ||
    !booking ||
    (booking.student_id !== user.id &&
      !(await isTeacherForBooking(supabase, booking.teacher_id, user.id)))
  ) {
    notFound();
  }

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('rating, comment')
    .eq('booking_id', booking.id)
    .maybeSingle();

  const { data: teacher } = await supabase
    .from('teacher_profiles')
    .select('user_id, languages_taught, hourly_rate')
    .eq('id', booking.teacher_id)
    .maybeSingle();

  const { data: teacherProfile } = teacher
    ? await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', teacher.user_id)
        .maybeSingle()
    : { data: null };

  const start = new Date(booking.start_time_utc);
  const end = new Date(booking.end_time_utc);
  const canJoin =
    booking.status === 'confirmed' &&
    Date.now() >= start.getTime() - 15 * 60 * 1000 &&
    Date.now() <= end.getTime() + 60 * 60 * 1000;

  const isStudent = booking.student_id === user.id;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Luxury Editorial Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-18 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-stone-950 dark:text-white">
                ESGlobal
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Language Academy
              </span>
            </div>
          </Link>

          <Link
            href={isStudent ? '/dashboard' : '/teacher/dashboard'}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Workspace</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8 sm:py-12 space-y-8">
        {/* Lesson Overview Card */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 ring-2 ring-stone-200/80 dark:ring-stone-700 shadow-sm">
                {teacherProfile?.avatar_url ? (
                  <img
                    src={teacherProfile.avatar_url}
                    alt={teacherProfile.full_name || 'Educator'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display font-black text-amber-500 text-xl">
                    {teacherProfile?.full_name?.charAt(0) || 'T'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Confirmed 1-on-1 Session
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                  Lesson with {teacherProfile?.full_name ?? 'Your Native Educator'}
                </h1>
                {teacher?.languages_taught && (
                  <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
                    {teacher.languages_taught.join(' • ')}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`self-start sm:self-center inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
                booking.status === 'confirmed'
                  ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : booking.status === 'completed'
                  ? 'border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  : 'border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              {booking.status === 'confirmed' && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              )}
              <span>{booking.status}</span>
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <span>{formatDate(start)}</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>
                {formatTime(start)} – {formatTime(end)}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 px-4 py-2.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <ShieldCheck className="h-4 w-4 text-stone-400" />
              <span>Stripe Escrow Verified</span>
            </span>
          </div>
        </div>

        {/* Virtual Classroom Section */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)] space-y-4">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
            <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
              Virtual Live Classroom
            </h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
              Join the live video lesson at your scheduled start time. Ensure your camera and microphone are permitted.
            </p>
          </div>

          <DailyCall
            roomUrl={booking.daily_room_url}
            bookingId={booking.id}
            canJoin={canJoin}
          />
        </div>

        {/* Reviews Section (When session is completed) */}
        {booking.status === 'completed' && isStudent && (
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
            <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white mb-2">
              Share Your Lesson Feedback
            </h2>
            <ReviewForm
              bookingId={booking.id}
              teacherId={booking.teacher_id}
              existingReview={existingReview}
            />
          </div>
        )}
      </main>
    </div>
  );
}

async function isTeacherForBooking(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  teacherId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('teacher_profiles')
    .select('id')
    .eq('id', teacherId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
