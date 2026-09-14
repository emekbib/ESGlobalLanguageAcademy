'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Bell,
  Menu,
  X,
  Compass,
  Users,
  Calendar,
  SlidersHorizontal,
  LogOut,
  CheckCircle2,
  GraduationCap,
  Moon,
} from 'lucide-react';

export default function DashboardHeader({
  fullName,
  avatarUrl,
  activeTab,
  onTabChange,
  onOpenLogout,
}: {
  fullName: string;
  avatarUrl: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenLogout: () => void;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstLetter = fullName?.charAt(0)?.toUpperCase() || 'S';

  const TAB_TITLES: Record<string, string> = {
    lessons: 'My Lessons',
    teachers: 'Find a Native Teacher',
    tutors: 'My Tutors',
    settings: 'Profile & Settings',
  };

  const currentTitle = TAB_TITLES[activeTab] || 'Dashboard';

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 sm:h-18 w-full items-center justify-between border-b border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-6 sm:px-10 backdrop-blur-md transition-colors">
        {/* Left on Mobile: Hamburger & Brand */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-sm font-black text-stone-950 dark:text-white">ESGlobal</span>
          </div>
        </div>

        {/* Left on Desktop: Intro.co Style Clean Bold Page Title */}
        <div className="hidden md:block">
          <h1 className="font-display text-xl font-black tracking-tight text-stone-900 dark:text-white">
            {currentTitle}
          </h1>
        </div>

        {/* Right Action Items: Clean Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-stone-700 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-4 py-3 bg-stone-50 dark:bg-stone-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Notifications
                  </span>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    1 New
                  </span>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-72 overflow-y-auto">
                  <div className="p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50 flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">Welcome to ESGlobal Academy</p>
                      <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                        Browse top-rated native teachers and schedule your first 1-on-1 speaking lesson.
                      </p>
                      <span className="mt-1 block text-[10px] text-stone-400 dark:text-stone-500">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Trigger */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-stone-200 dark:ring-stone-700 shadow-sm transition hover:ring-stone-400 dark:hover:ring-stone-500"
              aria-expanded={profileDropdownOpen}
              aria-label="User menu"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-950 dark:bg-stone-800 text-xs font-bold text-amber-300">
                  {firstLetter}
                </div>
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-13 z-50 w-56 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2 shadow-2xl animate-fade-in">
                <div className="border-b border-stone-100 dark:border-stone-800 px-3 py-2">
                  <p className="truncate text-xs font-bold text-stone-900 dark:text-white">{fullName}</p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 capitalize">Student Member</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 transition hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-stone-400" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white dark:bg-stone-900 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-stone-150 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-display font-black text-stone-950 dark:text-white">ESGlobal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-1.5">
              {[
                { id: 'lessons', label: 'My Lessons', icon: Calendar },
                { id: 'teachers', label: 'Find Teachers', icon: Compass },
                { id: 'tutors', label: 'My Tutors', icon: Users },
                { id: 'settings', label: 'Profile', icon: SlidersHorizontal },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition ${
                      isActive
                        ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-stone-150 dark:border-stone-800 pt-4 space-y-3">
              {/* Mobile Dark Mode Switch */}
              <div className="flex items-center justify-between px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60">
                <span className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                  <Moon className="h-4 w-4 text-stone-400" />
                  Dark Mode
                </span>
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDark ? 'bg-amber-400' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                  role="switch"
                  aria-label="Toggle dark mode"
                  aria-checked={isDark}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-stone-950 shadow-sm transition duration-200 ease-in-out ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
