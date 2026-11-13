import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorDisplay } from '@/components/ui/page-states';
import StudentDashboardShell from '@/components/dashboard/student-dashboard-shell';
import { confirmPaidBooking, releaseUnpaidHold } from '@/lib/payments/confirm-booking';
import { lookupRefunds } from '@/lib/payments/refund-status';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const bookingId = typeof resolvedParams.booking_id === 'string' ? resolvedParams.booking_id : null;
  const sessionId = typeof resolvedParams.session_id === 'string' ? resolvedParams.session_id : null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // Returning from Stripe: confirm only if Stripe says this exact booking was paid.
  let paymentNotice: 'confirmed' | 'not_paid' | 'cancelled' | null = null;
  if (bookingId && resolvedParams.payment === 'success' && sessionId) {
    const result = await confirmPaidBooking(supabase, user.id, bookingId, sessionId);
    paymentNotice = result.ok ? 'confirmed' : 'not_paid';
  } else if (bookingId && resolvedParams.payment === 'cancelled') {
    await releaseUnpaidHold(supabase, user.id, bookingId);
    paymentNotice = 'cancelled';
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, role, full_name, avatar_url, bio')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    return <ErrorDisplay message="We couldn’t load your profile. Please try again." />;
  }
  if (!profile) redirect('/onboarding');
  if (profile.role === 'admin') {
    redirect('/admin');
  }
  if (profile.role === 'teacher') {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(resolvedParams)) {
      if (typeof v === 'string') q.set(k, v);
    }
    const qs = q.toString();
    redirect(`/teacher/dashboard${qs ? `?${qs}` : ''}`);
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
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
      .eq('is_published', true)
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

  const nowMs = Date.now();
  const isLiveBooking = (b: { status: string; hold_expires_at?: string | null }) =>
    !(b.status === 'pending' && (!b.hold_expires_at || new Date(b.hold_expires_at).getTime() < nowMs));

  const refunds = await lookupRefunds(bookings ?? []);

  const enriched = (bookings ?? []).filter(isLiveBooking).map((b) => {
    const tp = teacherMap.get(b.teacher_id);
    const up = tp ? userProfileMap.get(tp.user_id) : null;
    return {
      ...b,
      ...(refunds.get(b.id) ?? {}),
      amount_cents: b.amount_cents,
      teacher_name: up?.full_name ?? 'Teacher',
      teacher_avatar: up?.avatar_url ?? null,
    };
  });

  const now = new Date();
  const upcoming = enriched.filter((b) => new Date(b.start_time_utc) >= now && b.status !== 'cancelled');
  const past = enriched.filter((b) => new Date(b.start_time_utc) < now || b.status === 'cancelled');

  const cleanName = (n: string) =>
    (n || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z0-9]/g, '').trim();

  const seenTutorNames = new Set<string>();
  const myTutors: any[] = [];

  (teacherProfiles ?? []).forEach((t) => {
    const up = userProfileMap.get(t.user_id);
    const rawName = up?.full_name ?? 'Native Educator';
    const key = cleanName(rawName);
    if (!key || key === 'not' || key.length < 3 || seenTutorNames.has(key)) return;
    seenTutorNames.add(key);

    const ratingData = teacherRatingMap.get(t.id);
    const avgRating = ratingData && ratingData.count > 0
      ? Math.round((ratingData.sum / ratingData.count) * 10) / 10
      : null;

    myTutors.push({
      id: t.id,
      userId: t.user_id,
      name: rawName,
      avatarUrl: up?.avatar_url ?? null,
      languages: t.languages_taught ?? [],
      hourlyRate: Number(t.hourly_rate),
      rating: avgRating,
      lessonsTaught: teacherLessonMap.get(t.id) ?? 0,
      hasBooked: !isAllFaculty,
    });
  });

  return (
    <StudentDashboardShell
      profile={profile}
      upcoming={upcoming as any}
      past={past as any}
      tutors={myTutors as any}
      paymentNotice={paymentNotice}
    />
  );
}
