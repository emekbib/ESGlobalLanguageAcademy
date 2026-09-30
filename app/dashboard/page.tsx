import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorDisplay } from '@/components/ui/page-states';
import StudentDashboardShell from '@/components/dashboard/student-dashboard-shell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const bookingId = typeof resolvedParams.booking_id === 'string' ? resolvedParams.booking_id : null;
  const isPaymentSuccess = resolvedParams.payment === 'success' || resolvedParams.booking === 'confirmed';

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // If returning from checkout, ensure the booking is marked confirmed in database immediately
  if (bookingId && isPaymentSuccess) {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
      .eq('student_id', user.id);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, role, full_name, avatar_url')
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

  // 1. Identify teacher IDs from bookings
  let teacherIds = Array.from(new Set((bookings ?? []).map((b) => b.teacher_id)));
  let isAllFaculty = false;

  let { data: teacherProfiles } = teacherIds.length
    ? await supabase
        .from('teacher_profiles')
        .select('id, user_id, languages_taught, hourly_rate')
        .in('id', teacherIds)
    : { data: [] };

  // If student has no bookings yet, load active faculty from database so "My Tutors" is never empty
  if (!teacherProfiles || teacherProfiles.length === 0) {
    isAllFaculty = true;
    const { data: allTeachers } = await supabase
      .from('teacher_profiles')
      .select('id, user_id, languages_taught, hourly_rate')
      .limit(10);
    teacherProfiles = allTeachers ?? [];
    teacherIds = (teacherProfiles ?? []).map((t) => t.id);
  }

  // Fetch real ratings from reviews table for these teacher profiles
  const { data: teacherReviews } = teacherIds.length
    ? await supabase
        .from('reviews')
        .select('teacher_id, rating')
        .in('teacher_id', teacherIds)
        .is('flag_reason', null)
    : { data: [] };

  // Build per-teacher rating map: teacher_profile_id -> { avgRating, count }
  const teacherRatingMap = new Map<string, { sum: number; count: number }>();
  (teacherReviews ?? []).forEach((r) => {
    const existing = teacherRatingMap.get(r.teacher_id) ?? { sum: 0, count: 0 };
    teacherRatingMap.set(r.teacher_id, { sum: existing.sum + r.rating, count: existing.count + 1 });
  });

  // Build per-teacher completed lesson count from bookings
  const teacherLessonMap = new Map<string, number>();
  (bookings ?? []).filter((b) => b.status === 'completed').forEach((b) => {
    teacherLessonMap.set(b.teacher_id, (teacherLessonMap.get(b.teacher_id) ?? 0) + 1);
  });

  const profileUserIds = Array.from(new Set((teacherProfiles ?? []).map((t) => t.user_id)));
  const { data: teacherUserProfiles } = profileUserIds.length
    ? await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', profileUserIds)
    : { data: [] };

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
    const ratingData = teacherRatingMap.get(t.id);
    const avgRating = ratingData && ratingData.count > 0
      ? Math.round((ratingData.sum / ratingData.count) * 10) / 10
      : null;
    return {
      id: t.id,
      userId: t.user_id,
      name: up?.full_name ?? 'Native Educator',
      avatarUrl: up?.avatar_url ?? null,
      languages: t.languages_taught ?? [],
      hourlyRate: t.hourly_rate ?? 25,
      rating: avgRating,
      lessonsTaught: teacherLessonMap.get(t.id) ?? 0,
      hasBooked: !isAllFaculty,
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
