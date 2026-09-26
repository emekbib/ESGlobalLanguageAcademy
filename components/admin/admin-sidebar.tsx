'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  GraduationCap,
  AlertTriangle,
  Users,
  LogOut,
  Moon,
  Sun,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  Calendar,
  Clock,
  CreditCard,
  BookOpen,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'pending_track2'
  | 'educators'
  | 'learners'
  | 'payments'
  | 'reviews'
  | 'accounts';

type AdminSidebarProps = {
  fullName: string;
  avatarUrl: string | null;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onOpenLogout: () => void;
  pendingTrack2Count?: number;
  flaggedCount: number;
  totalAccounts: number;
};

export default function AdminSidebar({
  fullName,
  avatarUrl,
  activeTab,
  onTabChange,
  onOpenLogout,
  pendingTrack2Count = 0,
  flaggedCount,
  totalAccounts,
}: AdminSidebarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme ? resolvedTheme === 'dark' : theme === 'dark');

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const firstLetter = fullName?.charAt(0)?.toUpperCase() || 'A';

  const NAV_ITEMS: {
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Operations Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'pending_track2',
      label: 'Pending Track 2',
      icon: Clock,
      badge: pendingTrack2Count > 0 ? pendingTrack2Count : undefined,
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    },
    {
      id: 'educators',
      label: 'Faculty Directory',
      icon: GraduationCap,
    },
    {
      id: 'learners',
      label: 'Learners Directory',
      icon: BookOpen,
    },
    {
      id: 'payments',
      label: 'Teacher Payments',
      icon: CreditCard,
    },
    {
      id: 'reviews',
      label: 'Flagged Reviews',
      icon: AlertTriangle,
      badge: flaggedCount > 0 ? flaggedCount : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    },
    {
      id: 'accounts',
      label: 'User Accounts',
      icon: Users,
      badge: totalAccounts,
      badgeColor: 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300/60 dark:border-stone-700',
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-4 md:flex transition-colors duration-200 overflow-hidden select-none">
      <div className="flex flex-col">
        {/* Brand Logo: Clean Monogram + Editorial Wordmark */}
        <div className="flex items-center justify-between px-2 py-1">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm transition group-hover:scale-105">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-bold tracking-tight text-stone-950 dark:text-white">
                  ESGlobal
                </span>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1 py-0.2 text-[8px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Admin
                </span>
              </div>
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Operations
              </span>
            </div>
          </Link>

          <Link
            href="/"
            title="View Public Academy"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Primary Admin Navigation */}
        <div className="mt-5">
          <p className="px-2 text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1.5">
            Operations Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive
                        ? 'text-amber-300 dark:text-stone-950'
                        : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`ml-auto rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${
                        isActive
                          ? 'border-white/20 bg-white/20 text-white dark:border-stone-950/20 dark:bg-stone-950/10 dark:text-stone-950'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Controls: Theme Switcher & Admin Capsule */}
      <div className="space-y-2.5 pt-3 border-t border-stone-150 dark:border-stone-800">
        {/* Dark Mode Toggle */}
        <div
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
          className="flex items-center justify-between rounded-xl px-2.5 py-1.5 cursor-pointer transition hover:bg-stone-100 dark:hover:bg-stone-800/80"
          aria-label="Toggle dark mode"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 select-none">
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-stone-500" />
            )}
            <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Toggle dark mode switch"
            aria-checked={isDark}
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDark ? 'bg-amber-400' : 'bg-stone-200 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-stone-950 shadow-sm transition duration-200 ease-in-out ${
                isDark ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* User Capsule */}
        <div className="flex items-center justify-between rounded-xl p-2 border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/60 transition hover:bg-stone-50 dark:hover:bg-stone-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-950 dark:bg-stone-800 border border-stone-800 dark:border-stone-700 text-xs font-bold text-amber-300 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                firstLetter
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-900 dark:text-white">{fullName}</p>
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 border border-amber-500/20">
                Administrator
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLogout}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
