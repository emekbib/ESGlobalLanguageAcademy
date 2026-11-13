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

  if (teacherError || reviewError || accountsError || bookingsError) {
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

  // Sanitize accounts: Remove corrupted records like 'Not' and ensure Estephanos is properly classified as Admin
  const sanitizedAccounts = (accounts ?? []).filter(
    (acc) =>
      acc.full_name &&
      acc.full_name.trim().toLowerCase() !== 'not' &&
      acc.full_name.trim().length >= 3 &&
      acc.user_id !== 'd0863492-7ff4-4dbd-870d-f06b4d37c95e'
  ).map((acc) => {
    const isEstephanos =
      acc.user_id === '86f00894-4c35-4dc9-b4fd-bc2d963e5bb1' ||
      acc.user_id === '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f' ||
      acc.full_name?.toLowerCase().includes('estephanos');

    if (isEstephanos) {
      return {
        ...acc,
        full_name: 'Estephanos Mekbib',
        role: 'admin',
      };
    }

    if (acc.full_name.trim().toLowerCase() === 'meareg') {
      return {
        ...acc,
        full_name: 'Meareg Teame',
        avatar_url: acc.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      };
    }
    return acc;
  });

  // Sanitize faculty: exclude teachers associated with corrupt accounts or the admin account
  const sanitizedFaculty = (allTeachers ?? []).filter((t) => {
    const name = names[t.user_id];
    if (name && (name.trim().toLowerCase() === 'not' || name.trim().length < 3)) return false;
    if (t.user_id === 'd0863492-7ff4-4dbd-870d-f06b4d37c95e' || t.user_id === '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f') return false;
    return true;
  });

  // Teacher accounts that never finished teacher setup (no teacher_profiles row).
  const existingFacultyUserIds = new Set(sanitizedFaculty.map((t) => t.user_id));
  const missingFaculty = sanitizedAccounts
    .filter((acc) => acc.role === 'teacher' && !existingFacultyUserIds.has(acc.user_id))
    // Shown honestly as "setup incomplete" — no invented bio, rate, or credentials.
    .map((acc) => ({
      id: acc.user_id,
      user_id: acc.user_id,
      bio: '',
      languages_taught: [] as string[],
      hourly_rate: null,
      years_experience: 0,
      teacher_type: 'community_tutor',
      application_status: 'incomplete',
      credentials: [] as string[],
      specialties: [] as string[],
      video_intro_url: null,
      is_published: false,
      created_at: acc.created_at,
    }));

  const combinedFaculty = [...sanitizedFaculty, ...missingFaculty];

  const adminFullName =
    profile.full_name && !profile.full_name.includes('Teacher Demo') && !profile.full_name.includes('Demo')
      ? profile.full_name
      : 'Estephanos Mekbib';

  return (
    <AdminDashboardShell
      profile={{
        user_id: profile.user_id,
        full_name: adminFullName,
        avatar_url: (profile as { avatar_url?: string | null }).avatar_url ?? null,
      }}
      pendingApplications={pendingTrack2 as any}
      faculty={combinedFaculty as any}
      flaggedReviews={flaggedReviews ?? []}
      accounts={sanitizedAccounts}
      bookings={bookings ?? []}
      names={names}
      avatars={avatars}
    />
  );
}
