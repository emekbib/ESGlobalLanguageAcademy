'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Check,
  Lock,
  Play,
  Trophy,
  BookOpen,
  Sparkles,
  Users,
  MessageSquare,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';

type PathNode = {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'tutor' | 'practice' | 'checkpoint';
  status: 'completed' | 'current' | 'locked';
  xp: number;
  offset: 'center' | 'left' | 'right' | 'far-left' | 'far-right';
};

const PATH_NODES: PathNode[] = [
  {
    id: 'node-1',
    title: 'Foundations & Greetings',
    description: 'Master essential greetings, formal etiquette, and everyday pleasantries.',
    type: 'lesson',
    status: 'completed',
    xp: 20,
    offset: 'center',
  },
  {
    id: 'node-2',
    title: 'Phonics & Pronunciation',
    description: 'Tune your ear to native tones, vowel lengths, and subtle dialect sounds.',
    type: 'lesson',
    status: 'completed',
    xp: 25,
    offset: 'right',
  },
  {
    id: 'node-3',
    title: '1-on-1 Practice with Tutor',
    description: 'Put your speaking to the test in a live private session with your native educator.',
    type: 'tutor',
    status: 'current',
    xp: 50,
    offset: 'center',
  },
  {
    id: 'node-4',
    title: 'Everyday Vocabulary',
    description: 'Expand your vocabulary bank with 40 high-frequency expressions and numbers.',
    type: 'lesson',
    status: 'locked',
    xp: 30,
    offset: 'left',
  },
  {
    id: 'node-5',
    title: 'Cultural Customs & Dining',
    description: 'Learn conversational phrases used at traditional meals, coffee, and gatherings.',
    type: 'practice',
    status: 'locked',
    xp: 35,
    offset: 'center',
  },
  {
    id: 'node-6',
    title: 'Unit 1 Mastery Checkpoint',
    description: 'Prove your conversational fluency across all Unit 1 topics to unlock Unit 2.',
    type: 'checkpoint',
    status: 'locked',
    xp: 100,
    offset: 'right',
  },
];

export default function LearningPath() {
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);

  const getOffsetClass = (offset: PathNode['offset']) => {
    switch (offset) {
      case 'left':
        return '-translate-x-12 sm:-translate-x-16';
      case 'right':
        return 'translate-x-12 sm:translate-x-16';
      case 'far-left':
        return '-translate-x-20 sm:-translate-x-24';
      case 'far-right':
        return 'translate-x-20 sm:translate-x-24';
      default:
        return 'translate-x-0';
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-xl pb-24">
      {/* Unit Banner: Duolingo Curved Header */}
      <div className="sticky top-20 z-10 overflow-hidden rounded-3xl border-2 border-emerald-600 bg-emerald-500 p-6 text-white shadow-xl shadow-emerald-500/10 transition-all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700/80 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-100">
                Unit 1 · Foundation
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-100">
                <Sparkles className="h-3.5 w-3.5" /> 80% Complete
              </span>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Conversational Essentials
            </h2>
            <p className="mt-1 text-xs text-emerald-100/90 leading-relaxed">
              Introduce yourself, pronounce sounds authentically, and book your milestone live lesson.
            </p>
          </div>

          <Link
            href="/teachers"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md transition hover:bg-emerald-50 active:scale-95"
          >
            <BookOpen className="h-4 w-4" />
            Guidebook
          </Link>
        </div>
      </div>

      {/* The Stepped Winding Path of Nodes */}
      <div className="mt-14 flex flex-col items-center space-y-12">
        {PATH_NODES.map((node) => {
          const isCompleted = node.status === 'completed';
          const isCurrent = node.status === 'current';
          const isLocked = node.status === 'locked';

          return (
            <div
              key={node.id}
              className={`relative flex flex-col items-center transition-transform duration-300 ${getOffsetClass(
                node.offset,
              )}`}
            >
              {/* "START" Tooltip Banner above Current Active Node */}
              {isCurrent && (
                <div className="absolute -top-12 z-10 animate-bounce">
                  <div className="relative rounded-2xl border-2 border-emerald-600 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-lg">
                    <span>START HERE</span>
                    <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-emerald-600 bg-white" />
                  </div>
                </div>
              )}

              {/* Node Button with Tactile 3D Base */}
              <button
                type="button"
                onClick={() => setSelectedNode(node)}
                className={`group relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-150 active:translate-y-1 ${
                  isCompleted
                    ? 'border-4 border-amber-400 bg-amber-400 shadow-[0_6px_0_#d97706] hover:bg-amber-300'
                    : isCurrent
                    ? 'border-4 border-emerald-600 bg-emerald-500 shadow-[0_6px_0_#059669] hover:bg-emerald-400 ring-8 ring-emerald-100 animate-pulse'
                    : 'border-4 border-stone-300 bg-stone-200 shadow-[0_6px_0_#a8a29e] hover:bg-stone-300 cursor-not-allowed'
                }`}
                aria-label={node.title}
              >
                {/* Node Icon */}
                {isCompleted ? (
                  <Check className="h-9 w-9 stroke-[3] text-white transition-transform group-hover:scale-110" />
                ) : isCurrent ? (
                  node.type === 'tutor' ? (
                    <Users className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
                  ) : (
                    <Play className="ml-1 h-8 w-8 fill-white text-white transition-transform group-hover:scale-110" />
                  )
                ) : node.type === 'checkpoint' ? (
                  <Trophy className="h-8 w-8 text-stone-400" />
                ) : (
                  <Lock className="h-7 w-7 text-stone-400" />
                )}
              </button>

              {/* Node Title Label under button */}
              <p
                className={`mt-2.5 max-w-[130px] text-center text-xs font-bold tracking-tight ${
                  isCompleted
                    ? 'text-stone-800'
                    : isCurrent
                    ? 'text-emerald-700'
                    : 'text-stone-400'
                }`}
              >
                {node.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Interactive Node Modal Drawer */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-stone-200 bg-white p-6 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  selectedNode.status === 'completed'
                    ? 'bg-amber-100 text-amber-800'
                    : selectedNode.status === 'current'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {selectedNode.status === 'completed'
                  ? 'Completed Lesson'
                  : selectedNode.status === 'current'
                  ? 'Active Milestone'
                  : 'Upcoming Lesson'}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" /> +{selectedNode.xp} XP
              </span>
            </div>

            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-stone-900">
              {selectedNode.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {selectedNode.description}
            </p>

            {/* Call to action */}
            <div className="mt-6 flex flex-col gap-2.5">
              {selectedNode.type === 'tutor' ? (
                <Link
                  href="/teachers"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-[0_4px_0_#059669] transition hover:bg-emerald-400 active:translate-y-1"
                >
                  <Users className="h-4 w-4" />
                  Book Milestone Lesson with Tutor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : selectedNode.status === 'locked' ? (
                <button
                  disabled
                  className="rounded-2xl border border-stone-200 bg-stone-100 py-3.5 text-sm font-bold text-stone-400 cursor-not-allowed"
                >
                  Complete previous lessons to unlock
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-stone-800"
                >
                  Practice Lesson Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
