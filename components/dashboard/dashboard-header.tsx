'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
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
      <header className="sticky top-0 z-20 flex h-22 sm:h-24 w-full items-center justify-between border-b border-stone-200/80 bg-white/95 px-6 sm:px-10 backdrop-blur-md">
        {/* Left on Mobile: Hamburger & Brand */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 transition"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-950 text-amber-300 shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-black text-stone-950">ESGlobal</span>
          </div>
        </div>

        {/* Left on Desktop: Intro.co Style Clean Bold Page Title */}
        <div className="hidden md:block">
          <h1 className="font-display text-2xl font-black tracking-tight text-stone-900">
            {currentTitle}
          </h1>
        </div>

        {/* Right Status Badges & Profile Capsule */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Speaking Streak Pill (Intro.co warm luxury style) */}
          <div
            className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 border border-amber-200/80 shadow-sm transition hover:bg-amber-100/60 cursor-pointer"
            title="Active 1-on-1 speaking streak with verified tutors"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>3 Week Streak</span>
          </div>

          {/* Membership Tier Badge */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-xs font-bold text-stone-800 border border-stone-200 shadow-sm"
            title="Verified Learner Account"
          >
            <Sparkles className="h-3.5 w-3.5 text-stone-600" />
            <span>Verified Student</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 bg-stone-50">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Notifications
                  </span>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                    1 New
                  </span>
                </div>
                <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                  <div className="p-4 transition hover:bg-stone-50 flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">Welcome to ESGlobal Academy</p>
                      <p className="mt-0.5 text-[11px] text-stone-500 leading-relaxed font-medium">
                        Browse top-rated native teachers and schedule your first 1-on-1 speaking lesson.
                      </p>
                      <span className="mt-1 block text-[10px] text-stone-400">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill Trigger */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition hover:bg-stone-50"
              aria-expanded={profileDropdownOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-stone-950 text-xs font-bold text-amber-300 shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  firstLetter
                )}
              </div>
              <span className="hidden text-xs font-bold text-stone-900 sm:inline max-w-[120px] truncate">
                {fullName}
              </span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-13 z-50 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl animate-fade-in">
                <div className="border-b border-stone-100 px-3 py-2">
                  <p className="truncate text-xs font-bold text-stone-900">{fullName}</p>
                  <p className="text-[11px] text-stone-400 capitalize">Student Member</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
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
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
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
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-150">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-950 text-amber-300 shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-display font-black text-stone-950">ESGlobal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100"
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
                        ? 'bg-stone-950 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-stone-150 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50"
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
