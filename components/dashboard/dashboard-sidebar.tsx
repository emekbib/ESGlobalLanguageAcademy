'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Compass,
  Users,
  SlidersHorizontal,
  LogOut,
  Moon,
  GraduationCap,
} from 'lucide-react';

type DashboardSidebarProps = {
  fullName: string;
  avatarUrl: string | null;
  role?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenLogout: () => void;
};

export default function DashboardSidebar({
  fullName,
  avatarUrl,
  role = 'student',
  activeTab,
  onTabChange,
  onOpenLogout,
}: DashboardSidebarProps) {
  const [darkMode, setDarkMode] = useState(false);

  const NAV_ITEMS = [
    {
      id: 'lessons',
      label: 'My Lessons',
      icon: Calendar,
    },
    {
      id: 'teachers',
      label: 'Find Teachers',
      icon: Compass,
    },
    {
      id: 'tutors',
      label: 'My Tutors',
      icon: Users,
    },
    {
      id: 'settings',
      label: 'Profile & Settings',
      icon: SlidersHorizontal,
    },
  ];

  const firstLetter = fullName?.charAt(0)?.toUpperCase() || 'S';

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-stone-200/80 bg-white px-5 py-7 md:flex">
      <div>
        {/* Brand Logo: Intro.co Minimalist Monogram + Editorial Wordmark */}
        <Link href="/" className="flex items-center gap-3 px-3 py-2 transition hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 text-amber-300 shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="font-display text-lg font-bold tracking-tight text-stone-950">
              ESGlobal
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Language Academy
            </span>
          </div>
        </Link>

        {/* Intro.co Style Navigation Items */}
        <div className="mt-8">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Learner Space
          </p>
          <nav className="mt-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-stone-950 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-950'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive ? 'text-amber-300' : 'text-stone-400 group-hover:text-stone-700'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Controls: Dark Mode Toggle + Editorial User Capsule */}
      <div className="space-y-4 pt-4 border-t border-stone-150">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-600">
            <Moon className="h-4 w-4 text-stone-400" />
            <span>Dark Mode</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              darkMode ? 'bg-stone-950' : 'bg-stone-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* User Capsule */}
        <div className="flex items-center justify-between rounded-2xl p-2.5 border border-stone-200/80 bg-stone-50/50 transition hover:bg-stone-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-950 text-sm font-bold text-amber-300 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                firstLetter
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-900">{fullName}</p>
              <p className="text-[11px] font-medium capitalize text-stone-400">{role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
