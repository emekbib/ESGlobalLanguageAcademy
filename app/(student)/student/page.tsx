import { redirect } from 'next/navigation';
import BookingsList from '@/components/student/bookings-list';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorDisplay } from '@/components/ui/page-states';
import type { Booking } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: bookings, error: bookingsError } = await supabase.from('bookings').select('id, student_id, teacher_id, start_time_utc, end_time_utc, status').eq('student_id', user.id).order('start_time_utc', { ascending: true });
  if (bookingsError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;
  const teacherIds = Array.from(new Set((bookings ?? []).map((booking) => booking.teacher_id)));
  const { data: teachers, error: teachersError } = teacherIds.length > 0 ? await supabase.from('teacher_profiles').select('id, user_id').in('id', teacherIds) : { data: [], error: null };
  if (teachersError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;
  const userIds = (teachers ?? []).map((teacher) => teacher.user_id);
  const { data: profiles, error: profilesError } = userIds.length > 0 ? await supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', userIds) : { data: [], error: null };
  if (profilesError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;
  const teacherById = new Map((teachers ?? []).map((teacher) => [teacher.id, teacher]));
  const profileByUserId = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
  const enriched = (bookings ?? []).map((booking) => {
    const teacher = teacherById.get(booking.teacher_id);
    const profile = teacher ? profileByUserId.get(teacher.user_id) : null;
    return { ...booking, teacher_name: profile?.full_name ?? 'Your teacher', teacher_avatar: profile?.avatar_url ?? null } as Booking & { teacher_name: string; teacher_avatar: string | null };
  });
  const now = Date.now();
  const upcoming = enriched.filter((booking) => booking.status === 'pending' || booking.status === 'confirmed' ? new Date(booking.start_time_utc).getTime() >= now : false);
  const past = enriched.filter((booking) => !upcoming.includes(booking));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Student portal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Your lessons</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Payment holds a slot for 15 minutes. Once payment succeeds, your lesson appears as confirmed here.</p>
      </div>
      <div className="mt-10 space-y-10">
        <BookingsList title="Upcoming lessons" bookings={upcoming} viewerRole="student" emptyMessage="You have no upcoming lessons yet." />
        <BookingsList title="Past lessons" bookings={past} viewerRole="student" emptyMessage="Your completed and cancelled lessons will appear here." />
      </div>
    </main>
  );
}
