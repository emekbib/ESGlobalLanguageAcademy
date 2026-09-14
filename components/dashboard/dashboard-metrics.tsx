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
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
      <div className="grid grid-cols-2 divide-y divide-stone-100 dark:divide-stone-800 sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-stone-100 sm:dark:divide-stone-800">
        {/* Metric 1 */}
        <button
          type="button"
          onClick={() => onNavigateTab('lessons')}
          className="group flex flex-col justify-center px-5 py-3.5 text-left transition hover:bg-stone-50/80 dark:hover:bg-stone-800/80"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Upcoming Lessons
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950 dark:text-white">
              {upcomingCount > 0 ? upcomingCount : '1'}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Scheduled</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </button>

        {/* Metric 2 */}
        <div className="flex flex-col justify-center px-5 py-3.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            1-on-1 Practice
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950 dark:text-white">
              {hoursCompleted}h
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Completed</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col justify-center px-5 py-3.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Speaking Streak
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950 dark:text-white">
              3 Wks
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <button
          type="button"
          onClick={() => onNavigateTab('teachers')}
          className="group flex flex-col justify-center px-5 py-3.5 text-left transition hover:bg-stone-50/80 dark:hover:bg-stone-800/80"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Focus Languages
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-stone-950 dark:text-white">
              5
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">East African</span>
          </div>
        </button>
      </div>
    </div>
  );
}
