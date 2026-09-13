'use client';

import { Trophy, Flame, Sparkles, ArrowUp, Medal } from 'lucide-react';

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Marcus Vance', xp: 620, streak: 14, avatar: 'M', isUser: false, league: 'Silver' },
  { rank: 2, name: 'Sophie Lindqvist', xp: 540, streak: 9, avatar: 'S', isUser: false, league: 'Silver' },
  { rank: 3, name: 'You (Meareg)', xp: 480, streak: 7, avatar: 'Y', isUser: true, league: 'Silver' },
  { rank: 4, name: 'Dawit Mengesha', xp: 410, streak: 5, avatar: 'D', isUser: false, league: 'Silver' },
  { rank: 5, name: 'Klara Becker', xp: 390, streak: 8, avatar: 'K', isUser: false, league: 'Silver' },
  { rank: 6, name: 'Amanuel Kebede', xp: 340, streak: 4, avatar: 'A', isUser: false, league: 'Silver' },
  { rank: 7, name: 'Lina Al-Hassan', xp: 310, streak: 6, avatar: 'L', isUser: false, league: 'Silver' },
  { rank: 8, name: 'Daniel Tesfaye', xp: 280, streak: 3, avatar: 'D', isUser: false, league: 'Silver' },
  { rank: 9, name: 'Elena Rostova', xp: 260, streak: 2, avatar: 'E', isUser: false, league: 'Silver' },
  { rank: 10, name: 'Lucas Meyer', xp: 220, streak: 1, avatar: 'L', isUser: false, league: 'Silver' },
];

export default function DashboardLeaderboardTab() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* League Banner */}
      <div className="overflow-hidden rounded-3xl border-2 border-purple-300/80 bg-gradient-to-r from-purple-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-purple-400/40 text-amber-300 shadow-inner">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  Division 2
                </span>
                <span className="text-xs text-purple-200">Resets in 2d 14h</span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
                Silver League
              </h2>
              <p className="text-xs text-purple-200/80">
                Top 7 advance to the prestigious Gold League on Sunday.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200">Your Standing</p>
            <p className="font-display text-2xl font-bold text-amber-300">#3 Place</p>
            <p className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
              <ArrowUp className="h-3 w-3" /> Promotion Zone
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-stone-50/70 px-6 py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
          <span>Rank & Learner</span>
          <span>Weekly XP</span>
        </div>

        <div className="divide-y divide-stone-100">
          {LEADERBOARD_USERS.map((user) => {
            const isTopThree = user.rank <= 3;
            return (
              <div
                key={user.rank}
                className={`flex items-center justify-between px-6 py-4 transition ${
                  user.isUser
                    ? 'bg-emerald-50/70 font-bold text-emerald-950 border-l-4 border-emerald-500'
                    : 'hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-6 font-mono text-sm font-bold text-center ${
                      user.rank === 1
                        ? 'text-amber-500'
                        : user.rank === 2
                        ? 'text-stone-400'
                        : user.rank === 3
                        ? 'text-amber-700'
                        : 'text-stone-400'
                    }`}
                  >
                    {user.rank}
                  </span>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white shadow-sm ring-1 ring-stone-200">
                    {user.avatar}
                  </div>

                  <div>
                    <p className="text-sm font-bold flex items-center gap-2">
                      {user.name}
                      {user.rank <= 7 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                          Advance
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-400 flex items-center gap-1 font-medium">
                      <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {user.streak} day streak
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-base font-bold text-stone-900">
                    {user.xp}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 ml-1">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
