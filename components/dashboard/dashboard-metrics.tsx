'use client';

import { Calendar, Clock, Flame, Globe, ArrowUpRight } from 'lucide-react';

type DashboardMetricsProps = {
  upcomingCount: number;
  completedCount: number;
  tutorsCount: number;
  onNavigateTab: (tab: string) => void;
};

export default function DashboardMetrics({
  upcomingCount,
  completedCount,
  tutorsCount,
  onNavigateTab,
}: DashboardMetricsProps) {
  const hoursCompleted = (completedCount * 1.0).toFixed(1);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* Card 1: Upcoming Lessons */}
      <button
        type="button"
        onClick={() => onNavigateTab('lessons')}
        className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/80 dark:hover:border-amber-400/40 hover:shadow-md cursor-pointer overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300 shadow-sm ring-1 ring-amber-500/20">
            <Calendar className="h-4 w-4" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>Scheduled</span>
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
              {upcomingCount > 0 ? upcomingCount : '1'}
            </span>
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">Session</span>
          </div>
          <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
            Upcoming Lessons
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
            <span>Next session booked</span>
            <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
        </div>
      </button>

      {/* Card 2: 1-on-1 Practice */}
      <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20">
            <Clock className="h-4 w-4" />
          </div>
          <span className="rounded-full border border-stone-200/60 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Immersion
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
              {hoursCompleted}h
            </span>
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">Total</span>
          </div>
          <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
            1-on-1 Practice
          </p>
          <p className="mt-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
            Completed speaking hours
          </p>
        </div>
      </div>

      {/* Card 3: Speaking Streak */}
      <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 shadow-sm ring-1 ring-rose-500/20">
            <Flame className="h-4 w-4" />
          </div>
          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            🔥 Active
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
              3 Wks
            </span>
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">Pace</span>
          </div>
          <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
            Speaking Streak
          </p>
          <p className="mt-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
            Weekly consistency record
          </p>
        </div>
      </div>

      {/* Card 4: Focus Languages */}
      <button
        type="button"
        onClick={() => onNavigateTab('teachers')}
        className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 dark:hover:border-sky-400/40 hover:shadow-md cursor-pointer overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400 shadow-sm ring-1 ring-sky-500/20">
            <Globe className="h-4 w-4" />
          </div>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            East Africa
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
              5
            </span>
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">Native</span>
          </div>
          <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
            Focus Languages
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
            <span>Amharic, Tigrigna + 3</span>
            <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
        </div>
      </button>
    </div>
  );
}
