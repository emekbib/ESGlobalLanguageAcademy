import { requireAdmin } from '@/lib/admin';
import { ErrorDisplay } from '@/components/ui/page-states';
import AdminDashboardShell from '@/components/admin/admin-dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { supabase, profile } = await requireAdmin();

  const [
    { data: applications, error: appError },
    { data: flaggedReviews, error: reviewError },
    { data: accounts, error: accountsError },
  ] = await Promise.all([
    supabase
      .from('teacher_profiles')
      .select(
        'id, user_id, bio, languages_taught, hourly_rate, years_experience, application_status, created_at'
      )
      .eq('application_status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('reviews')
      .select('id, teacher_id, student_id, rating, comment, flag_reason, created_at')
      .not('flagged_at', 'is', null)
      .order('flagged_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('user_id, full_name, role, suspended_at, suspension_reason')
      .in('role', ['student', 'teacher'])
      .order('full_name'),
  ]);

  if (appError || reviewError || accountsError) {
    return (
      <ErrorDisplay message="We couldn’t load the academy admin console. Please try again." />
    );
  }

  const ids = [
    ...(applications ?? []).map((item) => item.user_id),
    ...(flaggedReviews ?? []).map((item) => item.student_id),
    ...(accounts ?? []).map((item) => item.user_id),
  ];

  const { data: userProfiles } = ids.length
    ? await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', Array.from(new Set(ids)))
    : { data: [] };

  const names: Record<string, string> = {};
  (userProfiles ?? []).forEach((item) => {
    if (item.user_id && item.full_name) {
      names[item.user_id] = item.full_name;
    }
  });

  return (
    <AdminDashboardShell
      profile={{
        full_name: profile.full_name,
        avatar_url: (profile as { avatar_url?: string | null }).avatar_url ?? null,
      }}
      applications={applications ?? []}
      flaggedReviews={flaggedReviews ?? []}
      accounts={accounts ?? []}
      names={names}
    />
  );
}
