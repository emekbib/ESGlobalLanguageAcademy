'use client';

import Link from 'next/link';
import {
  Video,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

type BookingItem = {
  id: string;
  start_time_utc: string;
  end_time_utc: string;
  teacher_name: string;
  teacher_avatar: string | null;
  status: string;
};

export default function DashboardSpotlight({
  nextBooking,
  onNavigateTeachers,
}: {
  nextBooking: BookingItem | null;
  onNavigateTeachers: () => void;
}) {
  const spotlightTeacher = SAMPLE_TEACHERS[0]; // Bethelhem Mengistu

  if (nextBooking) {
    return (
      <div className="relative overflow-hidden rounded-[2.2rem] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 text-stone-950 dark:text-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-colors">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 dark:border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Next Live Lesson
              </span>
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                1-on-1 Video Classroom
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 ring-2 ring-emerald-500/30 dark:ring-emerald-400/40 shadow-sm">
                {nextBooking.teacher_avatar ? (
                  <img
                    src={nextBooking.teacher_avatar}
                    alt={nextBooking.teacher_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-amber-600 dark:text-amber-300 text-xl">
                    {nextBooking.teacher_name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                  {nextBooking.teacher_name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
                  <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                  {new Date(nextBooking.start_time_utc).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/booking/${nextBooking.id}`}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-950 dark:bg-stone-100 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white active:translate-y-0.5 cursor-pointer"
            >
              <Video className="h-4 w-4" />
              <span>Enter Classroom</span>
              <ArrowRight className="h-4 w-4 text-amber-300 dark:text-stone-950" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Intro.co Style Luxury Editorial Spotlight Hero (Light & Dark Mode)
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/90 dark:border-stone-800 bg-gradient-to-br from-white via-[#faf9f6] to-stone-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 text-stone-950 dark:text-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.35)] transition-colors">
      <div className="relative z-10 grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:items-center">
        {/* Left Column */}
        <div className="lg:col-span-7">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 dark:border-amber-400/30 bg-amber-500/10 dark:bg-amber-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
              <ShieldCheck className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              1-on-1 Native Mentorship
            </span>
          </div>

          <h2 className="mt-2.5 font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-stone-950 dark:text-white leading-tight">
            Connect directly with verified native teachers.
          </h2>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300 max-w-xl font-medium">
            Book private 30, 45, or 60-minute speaking sessions. Select your teacher, pick an open calendar slot, and hop into a live 1-on-1 video call.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onNavigateTeachers}
              className="group inline-flex items-center gap-2.5 rounded-full bg-stone-950 dark:bg-stone-100 py-2.5 pl-5 pr-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 cursor-pointer"
            >
              <span>Find a Native Tutor</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-stone-950 text-stone-950 dark:text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>100% Certified Educators</span>
            </div>
          </div>
        </div>

        {/* Right Column: Intro.co Expert Highlight Card */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/90 dark:bg-stone-950/70 p-4 sm:p-5 backdrop-blur-md shadow-sm dark:shadow-inner transition-colors">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Top Rated Educator
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{spotlightTeacher.rating}</span>
                <span className="text-stone-400 dark:text-stone-500 text-[10px]">
                  ({spotlightTeacher.lessonsTaught} sessions)
                </span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-3.5">
              <img
                src={spotlightTeacher.avatarUrl || undefined}
                alt={spotlightTeacher.name}
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-stone-200/80 dark:ring-stone-800 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-display font-bold text-stone-950 dark:text-white text-sm sm:text-base">
                  {spotlightTeacher.name}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate">
                  {spotlightTeacher.languages.join(' • ')}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  ${spotlightTeacher.hourlyRate} / 50 min
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateTeachers}
              className="mt-3.5 block w-full rounded-xl bg-stone-950 dark:bg-stone-100 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
            >
              View Available Slots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
