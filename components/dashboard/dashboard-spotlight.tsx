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
      <div className="relative overflow-hidden rounded-[2.2rem] bg-stone-950 p-7 sm:p-9 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Next Live Lesson
              </span>
              <span className="text-xs font-semibold text-stone-400">
                1-on-1 Video Classroom
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-stone-800 ring-2 ring-emerald-400/40 shadow-sm">
                {nextBooking.teacher_avatar ? (
                  <img
                    src={nextBooking.teacher_avatar}
                    alt={nextBooking.teacher_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-amber-300 text-xl">
                    {nextBooking.teacher_name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl font-black tracking-tight text-white">
                  {nextBooking.teacher_name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-300 font-medium">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
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
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-7 py-4 text-xs font-bold uppercase tracking-wider text-stone-950 shadow-lg transition hover:bg-stone-100 active:translate-y-0.5"
            >
              <Video className="h-4 w-4" />
              Enter Classroom
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Intro.co Style Luxury Editorial Spotlight Hero
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-stone-950 text-white shadow-xl">
      <div className="relative z-10 grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:items-center">
        {/* Left Column */}
        <div className="lg:col-span-7">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <ShieldCheck className="h-3 w-3" />
              1-on-1 Native Mentorship
            </span>
          </div>

          <h2 className="mt-2.5 font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
            Connect directly with verified native teachers.
          </h2>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300 max-w-xl font-medium">
            Book private 30, 45, or 60-minute speaking sessions. Select your teacher, pick an open calendar slot, and hop into a live 1-on-1 video call.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onNavigateTeachers}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white py-2.5 pl-5 pr-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 shadow-md transition hover:bg-stone-100 active:scale-95"
            >
              <span>Find a Native Tutor</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-950 text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              100% Certified Educators
            </div>
          </div>
        </div>

        {/* Right Column: Intro.co Expert Highlight Card */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-inner">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Top Rated Educator
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{spotlightTeacher.rating}</span>
                <span className="text-stone-400 text-[10px]">({spotlightTeacher.lessonsTaught} sessions)</span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-3.5">
              <img
                src={spotlightTeacher.avatarUrl || undefined}
                alt={spotlightTeacher.name}
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/30 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-display font-bold text-white text-sm sm:text-base">
                  {spotlightTeacher.name}
                </h4>
                <p className="text-xs text-stone-300 font-medium">
                  {spotlightTeacher.languages.join(' • ')}
                </p>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  ${spotlightTeacher.hourlyRate} / 50 min
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateTeachers}
              className="mt-3.5 block w-full rounded-xl bg-white/20 py-2 text-center text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/30"
            >
              View Available Slots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
