'use client';

import Link from 'next/link';
import {
  Calendar,
  Trophy,
  Target,
  Clock,
  ArrowRight,
  Flame,
  Sparkles,
  CheckCircle2,
  Video,
  Users,
} from 'lucide-react';

type BookingItem = {
  id: string;
  start_time_utc: string;
  end_time_utc: string;
  teacher_name: string;
  teacher_avatar: string | null;
  status: string;
};

export default function DashboardRightRail({
  upcomingBookings = [],
}: {
  upcomingBookings?: BookingItem[];
}) {
  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  return (
    <div className="space-y-6">
      {/* Widget 1: Next Live 1-on-1 Lesson */}
      <div className="overflow-hidden rounded-3xl border-2 border-stone-200/80 bg-white p-5 shadow-sm transition hover:border-stone-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Video className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              1-on-1 Practice
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            Live Tutor
          </span>
        </div>

        {nextBooking ? (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-100 ring-2 ring-emerald-500/30">
                {nextBooking.teacher_avatar ? (
                  <img
                    src={nextBooking.teacher_avatar}
                    alt={nextBooking.teacher_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-stone-600">
                    {nextBooking.teacher_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-900">
                  {nextBooking.teacher_name}
                </p>
                <p className="flex items-center gap-1 text-xs text-stone-500">
                  <Clock className="h-3 w-3" />
                  {new Date(nextBooking.start_time_utc).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <Link
              href={`/booking/${nextBooking.id}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-emerald-500 active:scale-98"
            >
              Enter Classroom
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm font-bold text-stone-900">No sessions booked yet</p>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Book a 1-on-1 conversation session with a certified native speaker to unlock your next unit.
            </p>
            <Link
              href="/teachers"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-stone-800"
            >
              <Users className="h-4 w-4" />
              Find a Native Tutor
            </Link>
          </div>
        )}
      </div>

      {/* Widget 2: Duolingo Daily Quests */}
      <div className="rounded-3xl border-2 border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Daily Quests
            </span>
          </div>
          <span className="text-xs font-semibold text-stone-400">Resets in 11h</span>
        </div>

        <div className="mt-4 space-y-4">
          {/* Quest 1 */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-800">Earn 50 XP today</span>
              <span className="font-bold text-amber-600">50 / 50 XP</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-full rounded-full bg-amber-500 transition-all" />
            </div>
          </div>

          {/* Quest 2 */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-800">Complete 2 lessons</span>
              <span className="font-bold text-emerald-600">2 / 2</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-full rounded-full bg-emerald-500 transition-all" />
            </div>
          </div>

          {/* Quest 3 */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-800">Practice with a native tutor</span>
              <span className="font-bold text-stone-500">0 / 1</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-0 rounded-full bg-sky-500 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Widget 3: Duolingo League Leaderboard */}
      <div className="rounded-3xl border-2 border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Silver League
            </span>
          </div>
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
            Top 7 Advance
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { rank: 1, name: 'Marcus Vance', xp: 620, avatar: 'M', isUser: false },
            { rank: 2, name: 'Sophie Lindqvist', xp: 540, avatar: 'S', isUser: false },
            { rank: 3, name: 'You', xp: 480, avatar: 'Y', isUser: true },
            { rank: 4, name: 'Dawit Mengesha', xp: 410, avatar: 'D', isUser: false },
            { rank: 5, name: 'Klara Becker', xp: 390, avatar: 'K', isUser: false },
          ].map((u) => (
            <div
              key={u.rank}
              className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs transition ${
                u.isUser
                  ? 'border border-emerald-500/50 bg-emerald-50/70 font-bold text-emerald-900 shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-4 font-mono font-bold text-stone-400">{u.rank}</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">
                  {u.avatar}
                </div>
                <span>{u.name}</span>
              </div>
              <span className="font-semibold text-stone-500">{u.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
