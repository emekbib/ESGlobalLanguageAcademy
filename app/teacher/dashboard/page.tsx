import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock,
  Eye,
  GraduationCap,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AvailabilityEditor from '@/components/teacher/availability-editor';
import BookingsList from '@/components/student/bookings-list';
import ConnectPayoutButton from '@/components/teacher/connect-payout-button';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { ErrorDisplay } from '@/components/ui/page-states';

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

  const complete = Boolean(
    teacherProfile?.bio &&
      teacherProfile.languages_taught?.length &&
      teacherProfile.hourly_rate > 0 &&
      teacherProfile.years_experience >= 0,
  );

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
    <main className="min-h-screen bg-[#faf9f6] text-stone-900">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Welcome Header */}
        <div className="border-b border-stone-200/80 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            Educator Workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Welcome back, {profile.full_name}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Manage your teaching profile, availability calendar, and student bookings.
          </p>
        </div>

        {!teacherProfile ? (
          <div className="mt-10 rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-stone-900">
              Your profile is waiting for you
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
              Set up your bio, languages, hourly rate, and experience to start appearing in the public
              teacher directory.
            </p>
            <Link
              href="/teacher/onboarding"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800"
            >
              Build my profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {/* Status Grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Profile Status
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-stone-900">
                      {teacherProfile.is_published ? 'Live in Directory' : 'Saved Privately'}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      teacherProfile.is_published
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {teacherProfile.is_published ? '● Live' : '○ Private'}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-stone-600">
                  {teacherProfile.is_published
                    ? 'Students can discover your profile in the directory and book slots from your calendar.'
                    : complete
                    ? 'Your profile is ready. Publish it to start accepting new students.'
                    : 'Complete your profile details before publishing to students.'}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/teacher/onboarding"
                    className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                  {teacherProfile.is_published && (
                    <Link
                      href={`/teachers/${teacherProfile.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Public Profile
                    </Link>
                  )}
                </div>
              </div>

              {/* Profile Stats Card */}
              <aside className="rounded-3xl border border-stone-200/80 bg-stone-950 p-6 text-white shadow-lg sm:p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-lg font-bold text-white">Overview</h2>
                <dl className="mt-6 space-y-4 text-xs">
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                    <dt className="text-stone-400">Languages Taught</dt>
                    <dd className="font-semibold text-white">
                      {teacherProfile.languages_taught?.length ?? 0}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                    <dt className="text-stone-400">Experience</dt>
                    <dd className="font-semibold text-white">
                      {teacherProfile.years_experience} Years
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-400">Lesson Rate</dt>
                    <dd className="font-semibold text-white">
                      ${teacherProfile.hourly_rate} / hr
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>

            {/* Payout & Availability */}
            <div className="space-y-6">
              <ConnectPayoutButton
                connected={Boolean(
                  teacherProfile.stripe_account_id && teacherProfile.stripe_onboarding_complete,
                )}
              />
              <AvailabilityEditor teacherId={teacherProfile.id} />
            </div>

            {/* Bookings */}
            {(upcomingBookings.length > 0 || pastBookings.length > 0) && (
              <div className="space-y-6">
                <BookingsList
                  bookings={upcomingBookings}
                  title="Upcoming Lessons"
                  emptyMessage="No upcoming lessons scheduled."
                  viewerRole="teacher"
                />
                <BookingsList
                  bookings={pastBookings}
                  title="Past Lessons"
                  emptyMessage="Your past lesson history will appear here."
                  viewerRole="teacher"
                />
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
