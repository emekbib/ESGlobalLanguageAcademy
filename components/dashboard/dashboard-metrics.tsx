'use client';

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
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="grid grid-cols-2 divide-y divide-stone-100 sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-stone-100">
        {/* Metric 1 */}
        <button
          type="button"
          onClick={() => onNavigateTab('lessons')}
          className="group flex flex-col justify-center px-5 py-3.5 text-left transition hover:bg-stone-50/80"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Upcoming Lessons
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950">
              {upcomingCount > 0 ? upcomingCount : '1'}
            </span>
            <span className="text-xs text-stone-500 font-medium">Scheduled</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </button>

        {/* Metric 2 */}
        <div className="flex flex-col justify-center px-5 py-3.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            1-on-1 Practice
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950">
              {hoursCompleted}h
            </span>
            <span className="text-xs text-stone-500 font-medium">Completed</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col justify-center px-5 py-3.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Speaking Streak
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950">
              3 Wks
            </span>
            <span className="text-xs text-stone-500 font-medium">Active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <button
          type="button"
          onClick={() => onNavigateTab('teachers')}
          className="group flex flex-col justify-center px-5 py-3.5 text-left transition hover:bg-stone-50/80"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Focus Languages
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950">
              5
            </span>
            <span className="text-xs text-stone-500 font-medium">East African</span>
          </div>
        </button>
      </div>
    </div>
  );
}
