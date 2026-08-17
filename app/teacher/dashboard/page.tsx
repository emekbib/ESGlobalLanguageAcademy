import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle2, CircleAlert, Clock, Eye, GraduationCap, Pencil } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AvailabilityEditor from '@/components/teacher/availability-editor';
import BookingsList from '@/components/student/bookings-list';
import ConnectPayoutButton from '@/components/teacher/connect-payout-button';
import NotificationBell from '@/components/notifications/notification-bell';
import ProfileMenu from '@/components/account/profile-menu';
import { ErrorDisplay } from '@/components/ui/page-states';

export default async function TeacherDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('user_id', user.id).maybeSingle();
  if (profileError) return <ErrorDisplay message="We couldn\u2019t load your profile. Please try again." />;
  if (!profile) redirect('/onboarding');
  if (profile.role === 'student') redirect('/dashboard');
  const { data: teacherProfile, error: teacherProfileError } = await supabase.from('teacher_profiles').select('id, bio, languages_taught, hourly_rate, years_experience, video_intro_url, is_published, stripe_account_id, stripe_onboarding_complete').eq('user_id', user.id).maybeSingle();
  if (teacherProfileError) return <ErrorDisplay message="We couldn\u2019t load your teacher profile. Please try again." />;
  const complete = Boolean(teacherProfile?.bio && teacherProfile.languages_taught?.length && teacherProfile.hourly_rate > 0 && teacherProfile.years_experience >= 0);

  let enrichedBookings: Array<{ id: string; teacher_id: string; student_id: string; start_time_utc: string; end_time_utc: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; created_at: string; teacher_name: string; teacher_avatar: string | null }> = [];
  if (teacherProfile) {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, teacher_id, student_id, start_time_utc, end_time_utc, status, created_at')
      .eq('teacher_id', teacherProfile.id)
      .order('start_time_utc', { ascending: true });
    if (bookingsError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;
    const studentIds = Array.from(new Set((bookings ?? []).map((b) => b.student_id)));
    const { data: studentProfiles, error: studentError } = studentIds.length
      ? await supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', studentIds)
      : { data: [], error: null };
    if (studentError) return <ErrorDisplay message="We couldn\u2019t load your lessons. Please try again." />;
    const studentMap = new Map((studentProfiles ?? []).map((p) => [p.user_id, p]));
    enrichedBookings = (bookings ?? []).map((b) => {
      const sp = studentMap.get(b.student_id);
      return { ...b, teacher_name: sp?.full_name ?? 'Student', teacher_avatar: sp?.avatar_url ?? null };
    });
  }
  const now = new Date();
  const upcomingBookings = enrichedBookings.filter((b) => new Date(b.start_time_utc) >= now && b.status !== 'cancelled');
  const pastBookings = enrichedBookings.filter((b) => new Date(b.start_time_utc) < now || b.status === 'cancelled');

  return <main className="min-h-screen bg-slate-50/70"><header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><Link href="/" className="flex items-center gap-2 font-bold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><GraduationCap className="h-5 w-5 text-primary-foreground" /></span>ESGlobalLanguageAcademy</Link><div className="flex items-center gap-4"><NotificationBell /><ProfileMenu fullName={profile.full_name} avatarUrl={profile.avatar_url ?? null} /></div></div></header><section className="mx-auto max-w-5xl px-6 py-14 sm:py-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Teacher space</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Welcome, {profile.full_name}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Your public profile is where students get to know your teaching style.</p>{!teacherProfile ? <div className="mt-10 rounded-3xl border bg-background p-8 shadow-sm"><CircleAlert className="h-8 w-8 text-primary" /><h2 className="mt-5 text-2xl font-bold">Your profile is waiting for you</h2><p className="mt-2 max-w-xl leading-7 text-muted-foreground">Add your bio, languages, rate, and experience to start appearing in the teacher directory.</p><Link href="/teacher/onboarding" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105">Build my profile<ArrowRight className="h-4 w-4" /></Link></div> : <div className="mt-10 space-y-6"><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-3xl border bg-background p-8 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Profile status</p><h2 className="mt-2 text-2xl font-bold">{teacherProfile.is_published ? 'Published and discoverable' : 'Saved privately'}</h2></div><div className={`rounded-full px-3 py-1.5 text-xs font-semibold ${teacherProfile.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{teacherProfile.is_published ? 'Live' : 'Private'}</div></div><p className="mt-4 leading-7 text-muted-foreground">{teacherProfile.is_published ? 'Students can find your profile in the public teacher directory.' : complete ? 'Your profile is complete. Edit it to publish or update your public details.' : 'Finish your profile before publishing it to students.'}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/teacher/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"><Pencil className="h-4 w-4" />Edit profile</Link>{teacherProfile.is_published && <Link href={`/teachers/${teacherProfile.id}`} className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-muted"><Eye className="h-4 w-4" />View public profile</Link>}</div></div><aside className="rounded-3xl border bg-slate-900 p-7 text-white shadow-sm"><CheckCircle2 className="h-8 w-8 text-cyan-300" /><h2 className="mt-5 text-xl font-bold">Your profile basics</h2><dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-slate-300">Languages</dt><dd className="font-semibold">{teacherProfile.languages_taught?.length ?? 0}</dd></div><div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-slate-300">Experience</dt><dd className="font-semibold">{teacherProfile.years_experience} years</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-300">Rate</dt><dd className="font-semibold">${teacherProfile.hourly_rate}/hr</dd></div></dl></aside></div><ConnectPayoutButton connected={Boolean(teacherProfile.stripe_account_id && teacherProfile.stripe_onboarding_complete)} /><AvailabilityEditor teacherId={teacherProfile.id} />{upcomingBookings.length > 0 || pastBookings.length > 0 ? <><BookingsList bookings={upcomingBookings} title="Upcoming lessons" emptyMessage="No upcoming lessons." viewerRole="teacher" /><BookingsList bookings={pastBookings} title="Past lessons" emptyMessage="Your past lessons will appear here." viewerRole="teacher" /></> : null}</div>}</section></main>;
}
