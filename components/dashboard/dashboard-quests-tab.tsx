'use client';

import { Target, Gem, Flame, Heart, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardQuestsTab() {
  const quests = [
    {
      id: 'q-1',
      title: 'Earn 50 XP today',
      description: 'Practice pronunciation, vocabulary, or complete an interactive session.',
      current: 50,
      target: 50,
      reward: '+20 Gems',
      rewardType: 'gem',
      completed: true,
    },
    {
      id: 'q-2',
      title: 'Complete 2 roadmap lessons',
      description: 'Finish Phonics and Everyday Vocabulary lessons in Unit 1.',
      current: 2,
      target: 2,
      reward: '+15 XP',
      rewardType: 'xp',
      completed: true,
    },
    {
      id: 'q-3',
      title: 'Practice with a native tutor',
      description: 'Book and attend a live 1-on-1 private lesson with a certified teacher.',
      current: 0,
      target: 1,
      reward: '+1 Lesson Credit',
      rewardType: 'heart',
      completed: false,
    },
    {
      id: 'q-4',
      title: 'Maintain 7-day speaking streak',
      description: 'Log in and complete at least one language exercise every day this week.',
      current: 7,
      target: 7,
      reward: '+50 XP & Flame Badge',
      rewardType: 'flame',
      completed: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900">
            Daily & Weekly Quests
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Complete learning challenges to earn Language Mastery XP, gems, and free 1-on-1 tutor credits
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
          <Clock className="h-4 w-4 text-stone-400" />
          <span>Resets in 11 hours</span>
        </div>
      </div>

      {/* Quests Cards */}
      <div className="space-y-4">
        {quests.map((q) => (
          <div
            key={q.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  q.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {q.completed ? <CheckCircle2 className="h-6 w-6" /> : <Target className="h-6 w-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-stone-900">{q.title}</h3>
                  {q.completed && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Completed
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed">{q.description}</p>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        q.completed ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {q.current} / {q.target}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-2.5 text-center shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Reward</p>
              <p className="font-display text-xs font-bold text-stone-900 mt-0.5">{q.reward}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
