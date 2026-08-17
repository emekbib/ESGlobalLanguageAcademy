import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, GraduationCap } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import DailyCall from '@/components/booking/daily-call';
import ReviewForm from '@/components/reviews/review-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, student_id, teacher_id, start_time_utc, end_time_utc, status, daily_room_url')
    .eq('id', id)
    .maybeSingle();
  if (error || !booking || (booking.student_id !== user.id && !(await isTeacherForBooking(supabase, booking.teacher_id, user.id)))) notFound();

  const { data: existingReview } = await supabase.from('reviews').select('rating, comment').eq('booking_id', booking.id).maybeSingle();
  const { data: teacher } = await supabase.from('teacher_profiles').select('user_id').eq('id', booking.teacher_id).maybeSingle();
  const { data: teacherProfile } = teacher ? await supabase.from('profiles').select('full_name').eq('user_id', teacher.user_id).maybeSingle() : { data: null };
  const start = new Date(booking.start_time_utc);
  const end = new Date(booking.end_time_utc);
  const canJoin = booking.status === 'confirmed' && Date.now() >= start.getTime() - 10 * 60 * 1000 && Date.now() <= end.getTime() + 60 * 60 * 1000;

  return (
    <main className="min-h-screen bg-slate-50/70">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><GraduationCap className="h-5 w-5 text-primary-foreground" /></span>ESGlobalLanguageAcademy</Link>
          <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Dashboard</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        <div className="mt-8 rounded-3xl border bg-background p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Booking details</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Lesson with {teacherProfile?.full_name ?? 'your teacher'}</h1>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2"><CalendarDays className="h-4 w-4" />{formatDate(start)}</span><span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2"><Clock className="h-4 w-4" />{formatTime(start)} – {formatTime(end)}</span><span className="rounded-full bg-emerald-100 px-3 py-2 font-semibold capitalize text-emerald-800">{booking.status}</span></div>
          {booking.status === 'confirmed' ? <div className="mt-10"><h2 className="text-xl font-bold">Your virtual classroom</h2><p className="mt-2 text-sm text-muted-foreground">The room opens 10 minutes before your lesson begins.</p><div className="mt-5"><DailyCall roomUrl={booking.daily_room_url} bookingId={booking.id} canJoin={canJoin} /></div></div> : <div className="mt-10 rounded-2xl border bg-muted/30 px-6 py-10 text-center"><p className="font-semibold">This lesson is not ready to join</p><p className="mt-2 text-sm text-muted-foreground">Complete payment and wait for the booking to be confirmed.</p></div>}
          {booking.status === 'completed' && booking.student_id === user.id && <div id="review" className="mt-10"><ReviewForm bookingId={booking.id} teacherId={booking.teacher_id} existingReview={existingReview} /></div>}
        </div>
      </section>
    </main>
  );
}

async function isTeacherForBooking(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, teacherId: string, userId: string): Promise<boolean> {
  const { data } = await supabase.from('teacher_profiles').select('id').eq('id', teacherId).eq('user_id', userId).maybeSingle();
  return Boolean(data);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}
