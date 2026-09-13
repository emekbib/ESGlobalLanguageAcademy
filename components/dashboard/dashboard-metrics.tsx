'use client';

import { Flame, Clock, Users, Calendar, ArrowUpRight } from 'lucide-react';

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Confirmed Lessons */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-amber-300 shadow-sm">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="mt-4">
          <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            {upcomingCount > 0 ? upcomingCount : '1'}
          </span>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Upcoming Lessons
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Classroom ready</span>
          </p>
        </div>
      </div>

      {/* Metric 2: Speaking Hours Practiced */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Clock className="h-5 w-5" />
        </div>
        <div className="mt-4">
          <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            {hoursCompleted}h
          </span>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            1-on-1 Practice Time
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-stone-600">
            <span>{completedCount} sessions completed</span>
          </p>
        </div>
      </div>

      {/* Metric 3: Weekly Speaking Streak */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
        </div>
        <div className="mt-4">
          <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            3 Wks
          </span>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Speaking Streak
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span>Active consistency</span>
          </p>
        </div>
      </div>

      {/* Metric 4: Verified Faculty Network */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-800">
          <Users className="h-5 w-5" />
        </div>
        <div className="mt-4">
          <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            {tutorsCount > 0 ? tutorsCount : '40+'}
          </span>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Native Educators
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-stone-600">
            <span>Across 8 languages</span>
          </p>
        </div>
      </div>
    </div>
  );
}
