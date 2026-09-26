import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorDisplay } from '@/components/ui/page-states';
import StudentDashboardShell from '@/components/dashboard/student-dashboard-shell';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    return <ErrorDisplay message="We couldn’t load your profile. Please try again." />;
  }
  if (!profile) redirect('/onboarding');
  if (profile.role === 'teacher') redirect('/teacher/dashboard');

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, student_id, teacher_id, start_time_utc, end_time_utc, status, created_at')
    .eq('student_id', user.id)
    .order('start_time_utc', { ascending: true });

  if (bookingsError) {
    return <ErrorDisplay message="We couldn’t load your lessons. Please try again." />;
  }

  const teacherIds = Array.from(new Set((bookings ?? []).map((b) => b.teacher_id)));
  const { data: teacherProfiles, error: teacherError } = teacherIds.length
    ? await supabase.from('teacher_profiles').select('id, user_id, languages_taught, hourly_rate').in('id', teacherIds)
    : { data: [], error: null };

  if (teacherError) {
    return <ErrorDisplay message="We couldn’t load your lessons. Please try again." />;
  }

  const profileUserIds = Array.from(new Set((teacherProfiles ?? []).map((t) => t.user_id)));
  const { data: teacherUserProfiles, error: teacherUserError } = profileUserIds.length
    ? await supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', profileUserIds)
    : { data: [], error: null };

  if (teacherUserError) {
    return <ErrorDisplay message="We couldn’t load your lessons. Please try again." />;
  }

  const teacherMap = new Map((teacherProfiles ?? []).map((t) => [t.id, t]));
  const userProfileMap = new Map((teacherUserProfiles ?? []).map((p) => [p.user_id, p]));

  const enriched = (bookings ?? []).map((b) => {
    const tp = teacherMap.get(b.teacher_id);
    const up = tp ? userProfileMap.get(tp.user_id) : null;
    return {
      ...b,
      teacher_name: up?.full_name ?? 'Teacher',
      teacher_avatar: up?.avatar_url ?? null,
    };
  });

  const now = new Date();
  const upcoming = enriched.filter((b) => new Date(b.start_time_utc) >= now && b.status !== 'cancelled');
  const past = enriched.filter((b) => new Date(b.start_time_utc) < now || b.status === 'cancelled');

  const myTutors = (teacherProfiles ?? []).map((t) => {
    const up = userProfileMap.get(t.user_id);
    return {
      id: t.id,
      name: up?.full_name ?? 'Teacher',
      avatarUrl: up?.avatar_url ?? null,
      languages: t.languages_taught ?? [],
      hourlyRate: t.hourly_rate ?? 25,
      rating: 5.0, // Mocked for now
      lessonsTaught: 0, // Mocked for now
    };
  });

  return (
    <StudentDashboardShell
      profile={profile}
      upcoming={upcoming as any}
      past={past as any}
      tutors={myTutors as any}
    />
  );
}
