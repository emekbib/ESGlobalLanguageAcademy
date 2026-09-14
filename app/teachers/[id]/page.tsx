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
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import BookingCard from '@/components/teacher/booking-card';
import ReviewsSection, { type Review } from '@/components/teacher/reviews-section';
import type { TeacherType } from '@/lib/types/database';
import { getSampleTeacherById } from '@/lib/data/sample-teachers';

export const dynamic = 'force-dynamic';

const BADGE_LABEL: Record<TeacherType, string> = {
  professional: 'Certified Professional Teacher',
  community_tutor: 'Native Community Tutor',
};

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Try fetching from database first
  const { data: teacher, error: teacherError } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  // Check sample teachers fallback if not found in database
  const sample = !teacher ? getSampleTeacherById(id) : null;

  if (!teacher && !sample) {
    notFound();
  }

  // Define normalized fields whether from DB or sample
  let fullName = '';
  let avatarUrl: string | null = null;
  let languagesTaught: string[] = [];
  let languagesSpoken: string[] = [];
  let teacherType: TeacherType = 'professional';
  let hourlyRate = 35;
  let rating = 5.0;
  let totalLessons = 0;
  let bio = '';
  let specialties: string[] = [];
  let credentials: string[] = [];
  let yearsExperience = 3;
  let videoIntroUrl: string | null = null;
  let reviews: Review[] = [];

  if (teacher) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', teacher.user_id)
      .maybeSingle();
    if (!profile) notFound();

    fullName = profile.full_name;
    avatarUrl = profile.avatar_url;
    languagesTaught = teacher.languages_taught ?? [];
    languagesSpoken = teacher.languages_spoken ?? [];
    teacherType = teacher.teacher_type as TeacherType;
    hourlyRate = Number(teacher.hourly_rate);
    bio = teacher.bio ?? '';
    specialties = teacher.specialties ?? [];
    credentials = teacher.credentials ?? [];
    yearsExperience = teacher.years_experience ?? 3;
    videoIntroUrl = teacher.video_intro_url;

    const { data: rawReviews } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, student_id')
      .eq('teacher_id', teacher.id)
      .order('created_at', { ascending: false });

    const studentIds = Array.from(new Set((rawReviews ?? []).map((r) => r.student_id)));
    const { data: studentProfiles } = studentIds.length
      ? await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', studentIds)
      : { data: null };

    const studentMap = new Map((studentProfiles ?? []).map((p) => [p.user_id, p.full_name]));

    reviews = (rawReviews ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.created_at,
      studentName: studentMap.get(r.student_id) ?? 'Student',
    }));

    rating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5.0;
    totalLessons = await fetchLessonCount(supabase, teacher.id);
  } else if (sample) {
    fullName = sample.name;
    avatarUrl = sample.avatarUrl;
    languagesTaught = sample.languages;
    languagesSpoken = sample.languages_spoken;
    teacherType = sample.teacherType;
    hourlyRate = sample.hourlyRate;
    rating = sample.rating;
    totalLessons = sample.lessonsTaught;
    bio = sample.bio;
    specialties = sample.specialties ?? [];
    credentials = sample.education ?? [];
    yearsExperience = 5;
    videoIntroUrl = sample.video_intro_url ?? null;
    reviews = sample.reviews;
  }

  const firstName = fullName.split(' ')[0];

  return (
    <main className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Navigation Header */}
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-28 sm:pt-32">
        {/* Back Link */}
        <Link
          href="/teachers"
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all educators
        </Link>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Main Column */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Teacher Profile Header Card (Intro.co luxury style) */}
            <div className="overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-md sm:h-32 sm:w-32">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-950 text-3xl font-bold text-amber-300">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      {BADGE_LABEL[teacherType]}
                    </span>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Verified Native
                    </span>
                  </div>

                  <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                    {fullName}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
                    <div className="flex items-center gap-1 font-bold text-stone-950 dark:text-white">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {rating.toFixed(1)}
                    </div>
                    <span className="text-stone-300 dark:text-stone-700">·</span>
                    <span>{totalLessons.toLocaleString()} 1-on-1 sessions taught</span>
                  </div>

                  {/* Languages Taught */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-400 mr-1">Teaches:</span>
                    {languagesTaught.map((lang: string) => (
                      <span
                        key={lang}
                        className="rounded-full bg-stone-950 dark:bg-stone-800 dark:border dark:border-stone-700 px-3.5 py-1 text-xs font-bold text-white shadow-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Also Speaks */}
                  {languagesSpoken && languagesSpoken.length > 0 && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      <Globe2 className="h-3.5 w-3.5 text-stone-400" />
                      Also speaks: <span className="text-stone-800 dark:text-stone-200 font-semibold">{languagesSpoken.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Video Intro (if available) */}
            {videoIntroUrl && (
              <div className="overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Faculty Preview
                </span>
                <h2 className="mt-1 mb-4 font-display text-lg font-bold text-stone-950 dark:text-white">
                  Video Introduction
                </h2>
                <a
                  href={videoIntroUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-stone-950 shadow-md"
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-stone-950 shadow-xl transition-transform duration-300 group-hover:scale-110">
                      <PlayCircle className="h-8 w-8" />
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* About Section */}
            <div className="overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Biography &amp; Methodology
              </span>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-stone-950 dark:text-white">
                About {firstName}
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-medium sm:text-base">
                {bio}
              </p>

              {/* Teaching Specialties */}
              {specialties && specialties.length > 0 && (
                <div className="mt-8 border-t border-stone-100 dark:border-stone-800 pt-6">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Teaching Specialties
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800 px-4 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials & Education */}
              {credentials && credentials.length > 0 && (
                <div className="mt-8 border-t border-stone-100 dark:border-stone-800 pt-6">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Accreditations &amp; Degrees
                  </p>
                  <ul className="space-y-2.5">
                    {credentials.map((c: string) => (
                      <li key={c} className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
                        <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience Badge */}
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-stone-950 dark:text-white">
                    {yearsExperience}+ Years Experience
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    Verified native educator with direct 1-on-1 student instruction
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <div className="overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-8">
              <ReviewsSection reviews={reviews} />
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <aside id="booking-section" className="lg:w-[380px] lg:shrink-0 scroll-mt-24">
            <div className="lg:sticky lg:top-28">
              <BookingCard teacherId={id} hourlyRate={hourlyRate} />
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-4 shadow-2xl backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Lesson Rate</p>
            <p className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
              ${hourlyRate} <span className="text-xs font-semibold text-stone-400">/ 50 min</span>
            </p>
          </div>
          <a
            href="#booking-section"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 dark:bg-stone-100 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white active:scale-95"
          >
            Select Slot
          </a>
        </div>
      </div>

      {/* Footer */}
      <Footer />
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
