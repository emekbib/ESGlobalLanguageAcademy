import { requireAdmin } from '@/lib/admin';
import { ErrorDisplay } from '@/components/ui/page-states';
import AdminDashboardShell from '@/components/admin/admin-dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { supabase, profile } = await requireAdmin();

  const [
    { data: allTeachers, error: teacherError },
    { data: flaggedReviews, error: reviewError },
    { data: accounts, error: accountsError },
    { data: bookings, error: bookingsError },
  ] = await Promise.all([
    supabase
      .from('teacher_profiles')
      .select(
        'id, user_id, bio, languages_taught, hourly_rate, years_experience, teacher_type, application_status, credentials, specialties, video_intro_url, is_published, created_at'
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('id, teacher_id, student_id, rating, comment, flag_reason, flagged_at, created_at')
      .or('rating.lt.3,flagged_at.not.is.null,flag_reason.not.is.null')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('user_id, full_name, role, avatar_url, suspended_at, suspension_reason, created_at')
      .order('full_name'),
    supabase
      .from('bookings')
      .select('id, student_id, teacher_id, status, amount_cents, teacher_payout_cents, start_time_utc, created_at')
      .order('created_at', { ascending: false }),
  ]);

  if (teacherError || reviewError || accountsError) {
    return (
      <ErrorDisplay message="We couldn’t load the academy admin console. Please try again." />
    );
  }

  // Pending Track 2 applications: professional teachers whose status is pending
  const pendingTrack2 = (allTeachers ?? []).filter(
    (t) => t.teacher_type === 'professional' && t.application_status === 'pending'
  );

  const ids = [
    ...(allTeachers ?? []).map((item) => item.user_id),
    ...(flaggedReviews ?? []).map((item) => item.student_id),
    ...(flaggedReviews ?? []).map((item) => item.teacher_id),
    ...(accounts ?? []).map((item) => item.user_id),
    ...(bookings ?? []).map((item) => item.student_id),
  ];

  const { data: userProfiles } = ids.length
    ? await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(new Set(ids)))
    : { data: [] };

  const names: Record<string, string> = {};
  const avatars: Record<string, string | null> = {};
  (userProfiles ?? []).forEach((item) => {
    if (item.user_id) {
      if (item.full_name) names[item.user_id] = item.full_name;
      avatars[item.user_id] = item.avatar_url ?? null;
    }
  });

  return (
    <AdminDashboardShell
      profile={{
        full_name: profile.full_name,
        avatar_url: (profile as { avatar_url?: string | null }).avatar_url ?? null,
      }}
      pendingApplications={pendingTrack2 as any}
      faculty={allTeachers ?? []}
      flaggedReviews={flaggedReviews ?? []}
      accounts={accounts ?? []}
      bookings={bookings ?? []}
      names={names}
      avatars={avatars}
    />
  );
}
