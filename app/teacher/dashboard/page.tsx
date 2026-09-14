import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import TeacherDashboardShell from '@/components/teacher/teacher-dashboard-shell';
import { ErrorDisplay } from '@/components/ui/page-states';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
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
  if (profile.role === 'student') redirect('/dashboard');

  const { data: teacherProfile, error: teacherProfileError } = await supabase
    .from('teacher_profiles')
    .select(
      'id, bio, languages_taught, hourly_rate, years_experience, video_intro_url, is_published, stripe_account_id, stripe_onboarding_complete',
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (teacherProfileError) {
    return <ErrorDisplay message="We couldn’t load your teacher profile. Please try again." />;
  }

  let enrichedBookings: Array<{
    id: string;
    teacher_id: string;
    student_id: string;
    start_time_utc: string;
    end_time_utc: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
    teacher_name: string;
    teacher_avatar: string | null;
  }> = [];

  if (teacherProfile) {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, teacher_id, student_id, start_time_utc, end_time_utc, status, created_at')
      .eq('teacher_id', teacherProfile.id)
      .order('start_time_utc', { ascending: true });

    if (bookingsError) {
      return <ErrorDisplay message="We couldn’t load your lessons. Please try again." />;
    }

    const studentIds = Array.from(new Set((bookings ?? []).map((b) => b.student_id)));
    const { data: studentProfiles, error: studentError } = studentIds.length
      ? await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', studentIds)
      : { data: [], error: null };

    if (studentError) {
      return <ErrorDisplay message="We couldn’t load your lessons. Please try again." />;
    }

    const studentMap = new Map((studentProfiles ?? []).map((p) => [p.user_id, p]));
    enrichedBookings = (bookings ?? []).map((b) => {
      const sp = studentMap.get(b.student_id);
      return {
        ...b,
        teacher_name: sp?.full_name ?? 'Student',
        teacher_avatar: sp?.avatar_url ?? null,
      };
    });
  }

  const now = new Date();
  const upcomingBookings = enrichedBookings.filter(
    (b) => new Date(b.start_time_utc) >= now && b.status !== 'cancelled',
  );
  const pastBookings = enrichedBookings.filter(
    (b) => new Date(b.start_time_utc) < now || b.status === 'cancelled',
  );

  return (
    <TeacherDashboardShell
      profile={{
        role: profile.role || 'teacher',
        full_name: profile.full_name || 'Educator',
        avatar_url: profile.avatar_url,
      }}
      teacherProfile={teacherProfile}
      upcomingBookings={upcomingBookings}
      pastBookings={pastBookings}
    />
  );
}
