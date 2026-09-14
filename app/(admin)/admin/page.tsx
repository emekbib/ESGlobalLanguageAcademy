import Link from 'next/link';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  AlertTriangle,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { ApplicationActions, SuspensionButton } from '@/components/admin/admin-controls';
import { ErrorDisplay } from '@/components/ui/page-states';

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

  const { data: profiles } = ids.length
    ? await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', Array.from(new Set(ids)))
    : { data: [] };

  const names = new Map((profiles ?? []).map((item) => [item.user_id, item.full_name]));

  const pendingCount = applications?.length ?? 0;
  const flaggedCount = flaggedReviews?.length ?? 0;
  const totalAccounts = accounts?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Luxury Editorial Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-18 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-stone-950 dark:text-white">
                  ESGlobal
                </span>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Admin
                </span>
              </div>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Operations Console
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 hidden sm:inline">
              Signed in as <strong className="text-stone-900 dark:text-white">{profile.full_name}</strong>
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition shadow-sm"
            >
              <span>Back to App</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14 space-y-10">
        {/* Headline */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Academy Management
          </span>
          <h1 className="mt-1 font-display text-2xl sm:text-4xl font-black tracking-tight text-stone-950 dark:text-white">
            Operations &amp; Moderation
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
            Review incoming educator applications, audit student review flags, and manage learner and teacher access permissions.
          </p>
        </div>

        {/* 3-Card Metrics Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Pending Educators
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                  {pendingCount}
                </span>
                <span className="text-xs text-stone-400">Applications</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300 ring-1 ring-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Flagged Reviews
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                  {flaggedCount}
                </span>
                <span className="text-xs text-stone-400">Needing Audit</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 ring-1 ring-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Total Accounts
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                  {totalAccounts}
                </span>
                <span className="text-xs text-stone-400">Users</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 ring-1 ring-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 2-Column Section: Applications & Flagged Reviews */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Teacher Applications */}
          <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                  Teacher Applications
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {pendingCount} candidate{pendingCount !== 1 ? 's' : ''} awaiting accreditation
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {applications?.length ? (
                applications.map((app) => (
                  <article
                    key={app.id}
                    className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 transition hover:border-stone-300 dark:hover:border-stone-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display font-bold text-stone-950 dark:text-white text-base">
                          {names.get(app.user_id) ?? 'Educator Applicant'}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
                          {app.languages_taught?.join(', ')} · ${app.hourly_rate}/50 min · {app.years_experience} yrs exp
                        </p>
                      </div>
                      <ApplicationActions teacherId={app.id} />
                    </div>
                    {app.bio && (
                      <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                        {app.bio}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <div className="py-12 text-center">
                  <UserCheck className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
                  <p className="mt-2 text-xs font-semibold text-stone-400">
                    No pending educator applications.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Flagged Reviews */}
          <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                  Flagged Reviews
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Content flagged by community members
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {flaggedReviews?.length ? (
                flaggedReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-display text-sm font-bold text-stone-950 dark:text-white">
                        ★ {review.rating}/5 from {names.get(review.student_id) ?? 'Student'}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                      {review.comment}
                    </p>
                    {review.flag_reason && (
                      <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                        Flag reason: {review.flag_reason}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <div className="py-12 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
                  <p className="mt-2 text-xs font-semibold text-stone-400">
                    All reviews are clear. No flags pending.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* User Account Access Table */}
        <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
              User Accounts &amp; Access Controls
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Manage permissions, restore accounts, or enact administrative suspensions
            </p>
          </div>

          <div className="mt-6 divide-y divide-stone-100 dark:divide-stone-800">
            {accounts?.map((account) => (
              <div
                key={account.user_id}
                className="flex items-center justify-between gap-4 py-4 transition hover:bg-stone-50/50 dark:hover:bg-stone-800/20 px-2 rounded-xl"
              >
                <div>
                  <p className="font-display font-bold text-sm text-stone-950 dark:text-white">
                    {account.full_name}
                  </p>
                  <p className="text-xs capitalize text-stone-400 mt-0.5">
                    {account.role}
                    {account.suspended_at && (
                      <span className="ml-2 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                        Suspended
                      </span>
                    )}
                  </p>
                </div>

                <SuspensionButton
                  userId={account.user_id}
                  suspended={Boolean(account.suspended_at)}
                />
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
