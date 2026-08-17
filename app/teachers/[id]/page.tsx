import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  GraduationCap,
  Star,
  PlayCircle,
  Globe2,
  BadgeCheck,
  Award,
} from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import BookingCard from '@/components/teacher/booking-card';
import ReviewsSection, { type Review } from '@/components/teacher/reviews-section';
import type { TeacherType } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

const BADGE_LABEL: Record<TeacherType, string> = {
  professional: 'Professional Teacher',
  community_tutor: 'Community Tutor',
};

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: teacher, error: teacherError } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();
  if (teacherError || !teacher) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('user_id', teacher.user_id)
    .maybeSingle();
  if (!profile) notFound();

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, student_id')
    .eq('teacher_id', teacher.id)
    .order('created_at', { ascending: false });

  // Fetch student names for reviews
  const studentIds = Array.from(new Set((rawReviews ?? []).map((r) => r.student_id)));
  const { data: studentProfiles } = studentIds.length
    ? await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', studentIds)
    : { data: null };

  const studentMap = new Map((studentProfiles ?? []).map((p) => [p.user_id, p.full_name]));

  const reviews: Review[] = (rawReviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? '',
    createdAt: r.created_at,
    studentName: studentMap.get(r.student_id) ?? 'Student',
  }));

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const totalLessons = await fetchLessonCount(supabase, teacher.id);

  const teacherType = teacher.teacher_type as TeacherType;
  const firstName = profile.full_name.split(' ')[0];

  return (
    <main className="min-h-screen bg-slate-50/70">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </span>
            ESGlobalLanguageAcademy
          </Link>
          <Link
            href="/teachers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to teachers
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left / main column */}
          <div className="min-w-0 flex-1">
            {/* Teacher header card */}
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="h-28 bg-gradient-to-br from-primary via-cyan-500 to-accent sm:h-36" />
              <div className="px-6 pb-6 sm:px-8">
                <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-primary/10 text-4xl font-bold text-primary shadow-lg sm:h-28 sm:w-28">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profile.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {BADGE_LABEL[teacherType]}
                    </span>
                  </div>

                  <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    {profile.full_name}
                  </h1>

                  {averageRating > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        · {totalLessons.toLocaleString()} lessons
                      </span>
                    </div>
                  )}

                  {/* Languages taught */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {teacher.languages_taught.map((lang: string) => (
                      <span
                        key={lang}
                        className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Also speaks */}
                  {teacher.languages_spoken && teacher.languages_spoken.length > 0 && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Globe2 className="h-4 w-4" />
                      Also speaks: {teacher.languages_spoken.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Intro video */}
            {teacher.video_intro_url && (
              <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="p-5">
                  <h2 className="mb-3 text-lg font-bold">Video introduction</h2>
                  <a
                    href={teacher.video_intro_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-muted"
                  >
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg transition-transform group-hover:scale-110">
                        <PlayCircle className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* About */}
            <div className="mt-6 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-bold">About {firstName}</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">
                {teacher.bio}
              </p>

              {/* Specialties */}
              {teacher.specialties && teacher.specialties.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold">Teaching specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specialties.map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials */}
              {teacher.credentials && teacher.credentials.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <Award className="h-4 w-4 text-primary" />
                    Credentials
                  </p>
                  <ul className="space-y-1.5">
                    {teacher.credentials.map((c: string) => (
                      <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BadgeCheck className="h-4 w-4 text-emerald-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience */}
              <div className="mt-6 flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teacher.years_experience}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.years_experience === 1 ? 'year' : 'years'} teaching experience
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-6 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <ReviewsSection reviews={reviews} />
            </div>
          </div>

          {/* Right column — booking card */}
          <aside className="lg:w-[340px] lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <BookingCard teacherId={teacher.id} hourlyRate={Number(teacher.hourly_rate)} />
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 shadow-lg backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-display text-lg font-bold text-primary">
              ${Number(teacher.hourly_rate)}/hr
            </p>
          </div>
          <Button asChild size="lg" className="flex-1">
            <Link href={`/booking/${teacher.id}`}>Book a lesson</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

async function fetchLessonCount(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  teacherId: string,
): Promise<number> {
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .eq('status', 'completed');
  return count ?? 0;
}
