import Link from 'next/link';
import { Calendar, CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import BookingsList from '@/components/student/bookings-list';
import NotificationBell from '@/components/notifications/notification-bell';
import { ErrorDisplay } from '@/components/ui/page-states';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role, full_name').eq('user_id', user.id).maybeSingle();
  if (profileError) return <ErrorDisplay message="We couldn\u2019t load your profile. Please try again." />;
  if (!profile) redirect('/onboarding');
  if (profile.role === 'teacher') redirect('/teacher/dashboard');

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, student_id, teacher_id, start_time_utc, end_time_utc, status, created_at')
    .eq('student_id', user.id)
    .order('start_time_utc', { ascending: true });
  if (bookingsError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;

  const teacherIds = Array.from(new Set((bookings ?? []).map((b) => b.teacher_id)));
  const { data: teacherProfiles, error: teacherError } = teacherIds.length
    ? await supabase.from('teacher_profiles').select('id, user_id').in('id', teacherIds)
    : { data: [], error: null };
  if (teacherError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;
  const profileUserIds = Array.from(new Set((teacherProfiles ?? []).map((t) => t.user_id)));
  const { data: teacherUserProfiles, error: teacherUserError } = profileUserIds.length
    ? await supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', profileUserIds)
    : { data: [], error: null };
  if (teacherUserError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;

  const teacherMap = new Map((teacherProfiles ?? []).map((t) => [t.id, t]));
  const userProfileMap = new Map((teacherUserProfiles ?? []).map((p) => [p.user_id, p]));

  const enriched = (bookings ?? []).map((b) => {
    const tp = teacherMap.get(b.teacher_id);
    const up = tp ? userProfileMap.get(tp.user_id) : null;
    return { ...b, teacher_name: up?.full_name ?? 'Teacher', teacher_avatar: up?.avatar_url ?? null };
  });

  const now = new Date();
  const upcoming = enriched.filter((b) => new Date(b.start_time_utc) >= now && b.status !== 'cancelled');
  const past = enriched.filter((b) => new Date(b.start_time_utc) < now || b.status === 'cancelled');

  return (
    <main className="min-h-screen bg-slate-50/70">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><GraduationCap className="h-5 w-5 text-primary-foreground" /></span>
            ESGlobalLanguageAcademy
          </Link>
          <div className="flex items-center gap-4"><NotificationBell /><Link href="/teachers" className="text-sm font-semibold text-primary hover:underline">Find a teacher</Link></div>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Student space</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Welcome, {profile.full_name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Your learning journey starts here. Browse teachers, book lessons, and track your progress.</p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-background p-5 text-center shadow-sm">
            <Calendar className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-3xl font-bold">{upcoming.length}</p>
            <p className="text-sm text-muted-foreground">Upcoming lessons</p>
          </div>
          <div className="rounded-2xl border bg-background p-5 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
            <p className="mt-3 text-3xl font-bold">{past.filter((b) => b.status === 'completed').length}</p>
            <p className="text-sm text-muted-foreground">Completed lessons</p>
          </div>
          <div className="rounded-2xl border bg-background p-5 text-center shadow-sm">
            <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-3xl font-bold">{past.length}</p>
            <p className="text-sm text-muted-foreground">Past lessons</p>
          </div>
        </div>

        <BookingsList bookings={upcoming} title="Upcoming lessons" emptyMessage="No upcoming lessons yet. Browse teachers to book your first session." viewerRole="student" />
        <BookingsList bookings={past} title="Past lessons" emptyMessage="Your past lessons will appear here." viewerRole="student" />
      </section>
    </main>
  );
}
