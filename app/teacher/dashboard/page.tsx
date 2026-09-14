import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Eye,
  GraduationCap,
  Pencil,
  Sparkles,
  DollarSign,
  Users,
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

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-28 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 pb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Educator Workspace
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
              Welcome back, {profile.full_name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">
              Manage your teaching profile, weekly availability calendar, and student lesson roster.
            </p>
          </div>

          {teacherProfile && (
            <div className="flex items-center gap-3">
              <Link
                href="/teacher/onboarding"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Link>
              {teacherProfile.is_published && (
                <Link
                  href={`/teachers/${teacherProfile.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-stone-800"
                >
                  <Eye className="h-3.5 w-3.5 text-amber-300" />
                  View Public Profile
                </Link>
              )}
            </div>
          )}
        </div>

        {!teacherProfile ? (
          <div className="rounded-3xl border border-stone-200/80 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-amber-300 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-black text-stone-950">
              Your profile is waiting for you
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-stone-500 font-medium">
              Set up your bio, languages, hourly rate, and experience to start appearing in the public
              teacher directory.
            </p>
            <Link
              href="/teacher/onboarding"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800"
            >
              Build My Teacher Profile
              <ArrowRight className="h-4 w-4 text-amber-300" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 4-Card Luxury Metric Grid (Intro.co style) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric 1: Rate */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-amber-300 shadow-sm">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <span className="font-display text-3xl font-black text-stone-950">
                    ${teacherProfile.hourly_rate}
                  </span>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Per 50-Min Lesson
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    100% Direct Payout
                  </p>
                </div>
              </div>

              {/* Metric 2: Upcoming Lessons */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <span className="font-display text-3xl font-black text-stone-950">
                    {upcomingBookings.length}
                  </span>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Upcoming Bookings
                  </p>
                  <p className="mt-2 text-xs font-semibold text-stone-600">
                    Next session scheduled
                  </p>
                </div>
              </div>

              {/* Metric 3: Experience */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <span className="font-display text-3xl font-black text-stone-950">
                    {teacherProfile.years_experience} Yrs
                  </span>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Teaching Experience
                  </p>
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    Verified Educator
                  </p>
                </div>
              </div>

              {/* Metric 4: Directory Status */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-800">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <span className="font-display text-xl font-black text-stone-950">
                    {teacherProfile.is_published ? 'Live in Directory' : 'Private Draft'}
                  </span>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Profile Visibility
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    {teacherProfile.is_published ? '● Accepting Students' : '○ Unpublished'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payout Setup & Availability */}
            <div className="space-y-6">
              <ConnectPayoutButton
                connected={Boolean(
                  teacherProfile.stripe_account_id && teacherProfile.stripe_onboarding_complete,
                )}
              />
              <AvailabilityEditor teacherId={teacherProfile.id} />
            </div>

            {/* Lessons Section */}
            {(upcomingBookings.length > 0 || pastBookings.length > 0) && (
              <div className="space-y-6">
                <BookingsList
                  bookings={upcomingBookings}
                  title="Upcoming Student Lessons"
                  emptyMessage="No upcoming student lessons scheduled."
                  viewerRole="teacher"
                />
                <BookingsList
                  bookings={pastBookings}
                  title="Lesson History"
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
