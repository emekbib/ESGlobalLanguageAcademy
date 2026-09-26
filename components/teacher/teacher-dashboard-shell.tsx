'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Eye,
  Pencil,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  Moon,
  Sun,
  MessageSquare,
  LogOut,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import AvailabilityEditor from './availability-editor';
import BookingsList from '@/components/student/bookings-list';
import ConnectPayoutButton from './connect-payout-button';
import LogoutModal from '@/components/dashboard/logout-modal';
import TeacherAccountTab from './teacher-account-tab';
import DashboardMessagesTab from '@/components/dashboard/dashboard-messages-tab';

type BookingItem = {
  id: string;
  teacher_id: string;
  student_id: string;
  start_time_utc: string;
  end_time_utc: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  teacher_name: string;
  teacher_avatar: string | null;
};

type TeacherDashboardShellProps = {
  profile: {
    user_id: string;
    role: string;
    full_name: string;
    avatar_url: string | null;
  };
  teacherProfile: {
    id: string;
    bio: string;
    languages_taught: string[];
    hourly_rate: number;
    years_experience: number;
    video_intro_url?: string | null;
    is_published: boolean;
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean | null;
    teacher_type?: string | null;
  } | null;
  upcomingBookings: BookingItem[];
  pastBookings: BookingItem[];
  readOnly?: boolean;
};

export default function TeacherDashboardShell({
  profile,
  teacherProfile,
  upcomingBookings,
  pastBookings,
  readOnly = false,
}: TeacherDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'bookings' | 'payouts' | 'messages' | 'profile'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme ? resolvedTheme === 'dark' : theme === 'dark');

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const firstLetter = profile.full_name?.charAt(0)?.toUpperCase() || 'T';

  const NAV_ITEMS = [
    {
      id: 'overview',
      label: 'Overview & Stats',
      icon: Calendar,
    },
    {
      id: 'schedule',
      label: 'Weekly Availability',
      icon: Clock,
    },
    {
      id: 'bookings',
      label: 'Student Lessons',
      icon: Users,
    },
    {
      id: 'payouts',
      label: 'Stripe Payouts',
      icon: CreditCard,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
    },
    {
      id: 'profile',
      label: 'Account Details',
      icon: SlidersHorizontal,
    },
  ];

  const TAB_TITLES: Record<string, string> = {
    overview: 'Educator Workspace',
    schedule: 'Weekly Availability Schedule',
    bookings: 'Student Lesson Roster',
    payouts: 'Direct Bank Payouts',
    messages: 'Student Messages',
    profile: 'Educator Profile & Account Details',
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* DESKTOP TEACHER SIDEBAR (Intro.co luxury w-72 layout) */}
      {/* ========================================================================= */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 px-5 py-7 md:flex transition-colors duration-200">
        <div>
          {/* Brand Logo: Intro.co Minimalist Monogram + Editorial Wordmark */}
          <Link href="/" className="flex items-center gap-3 px-3 py-2 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-stone-950 dark:text-white">
                ESGlobal
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Language Academy
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="mt-8">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Educator Workspace
            </p>
            <nav className="mt-3 space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={`group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isActive
                          ? 'text-amber-300 dark:text-stone-950'
                          : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300'
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 dark:bg-stone-950" />
                    )}
                  </button>
                );
              })}

              {/* View Public Profile Link */}
              {teacherProfile?.id && (
                <Link
                  href={`/teachers/${teacherProfile.id}`}
                  className="group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-white transition-all duration-200"
                >
                  <Eye className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300" />
                  <span>Public Profile</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                </Link>
              )}

              {/* Edit Profile Link */}
              <Link
                href="/teacher/onboarding"
                className="group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-white transition-all duration-200"
              >
                <Pencil className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300" />
                <span>Edit Profile Details</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom User Area & Logout */}
        <div className="space-y-4 border-t border-stone-100 dark:border-stone-800 pt-5">
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
            className="flex items-center justify-between rounded-2xl px-3 py-2 cursor-pointer transition hover:bg-stone-100 dark:hover:bg-stone-800/80"
            aria-label="Toggle dark mode"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 select-none">
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-stone-500" />
              )}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDark ? 'bg-amber-400' : 'bg-stone-200 dark:bg-stone-700'
              }`}
              role="switch"
              aria-label="Toggle dark mode switch"
              aria-checked={isDark}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-stone-950 shadow-sm transition duration-200 ease-in-out ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 p-2.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-950 dark:bg-stone-800 border border-stone-800 dark:border-stone-700 text-xs font-bold text-amber-300 shadow-sm">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  firstLetter
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-stone-900 dark:text-white">{profile.full_name}</p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Native Educator
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="rounded-xl p-2 text-stone-400 hover:bg-white dark:hover:bg-stone-700 hover:text-stone-950 dark:hover:text-white hover:shadow-sm transition"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER NAVIGATION */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white dark:bg-stone-900 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-display font-black text-stone-950 dark:text-white">ESGlobal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {teacherProfile?.id && (
                <Link
                  href={`/teachers/${teacherProfile.id}`}
                  className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <Eye className="h-4 w-4" />
                  <span>Public Profile</span>
                </Link>
              )}
            </nav>

            <div className="mt-auto border-t border-stone-100 dark:border-stone-800 pt-6 space-y-3">
              {/* Mobile Dark Mode Toggle */}
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
                className="flex items-center justify-between px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 cursor-pointer"
                aria-label="Toggle dark mode"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 select-none">
                  {isDark ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-stone-400" />
                  )}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDark ? 'bg-amber-400' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                  role="switch"
                  aria-label="Toggle dark mode switch"
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
                onClick={() => setLogoutModalOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-3 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex flex-col min-h-screen md:pl-72">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 sm:h-18 w-full items-center justify-between border-b border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-6 sm:px-10 backdrop-blur-md">
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-sm"
              aria-label="Open mobile menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-display font-black text-stone-950 dark:text-white">ESGlobal</span>
          </div>

          <div className="hidden md:block">
            <h1 className="font-display text-xl font-black tracking-tight text-stone-900 dark:text-white">
              {TAB_TITLES[activeTab]}
            </h1>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-3">
            {teacherProfile?.id && (
              <Link
                href={`/teachers/${teacherProfile.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-2 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-sm transition hover:bg-stone-50 dark:hover:bg-stone-700"
              >
                <Eye className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                <span className="hidden sm:inline">View Public Profile</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 px-4 py-2 text-xs font-bold text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5 text-amber-300 dark:text-stone-950" />
              <span>Edit Details</span>
            </button>

            {/* Quick Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-amber-300 transition hover:bg-stone-50 dark:hover:bg-stone-700 shadow-sm"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-stone-500" />
              )}
            </button>

            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-stone-200 dark:ring-stone-800 shadow-sm">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-950 dark:bg-stone-800 text-xs font-bold text-amber-300">
                  {firstLetter}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="mx-auto w-full max-w-5xl px-6 py-6 sm:px-10 space-y-6">
          {readOnly && (
            <div className="mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Admin Preview Mode</h3>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    You are viewing the educator dashboard in read-only preview mode. You cannot save changes or accept bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' ? (
            <TeacherAccountTab
              profile={profile}
              teacherProfile={teacherProfile}
            />
          ) : !teacherProfile ? (
            <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-black text-stone-950 dark:text-white">
                Your educator profile is waiting for you
              </h2>
              <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-stone-500 dark:text-stone-400 font-medium">
                Set up your bio, languages, hourly rate, and experience to start appearing in the public teacher directory.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
              >
                <span>Build My Teacher Profile</span>
                <ArrowRight className="h-4 w-4 text-amber-300 dark:text-stone-950" />
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Welcome Greeting */}
                  <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Educator Workspace
                    </span>
                    <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                      Welcome back, {profile.full_name}
                    </h2>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      Manage your teaching profile, weekly availability calendar, and student lesson roster.
                    </p>
                  </div>

                  {/* 4-Metric Executive Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {/* Card 1: Lesson Rate */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/80 dark:hover:border-emerald-400/40 hover:shadow-md cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <span className="rounded-full border border-stone-200/60 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                          Per 50 min
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                            ${teacherProfile.hourly_rate ?? 35}
                          </span>
                          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">USD</span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                          Lesson Base Rate
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                          <span>Adjust hourly pricing</span>
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </button>

                    {/* Card 2: Upcoming Bookings */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/80 dark:hover:border-amber-400/40 hover:shadow-md cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300 shadow-sm ring-1 ring-amber-500/20">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Roster
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                            {upcomingBookings?.length ?? 0}
                          </span>
                          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">Sessions</span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                          Upcoming Bookings
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                          <span>View student lessons</span>
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </button>

                    {/* Card 3: Experience */}
                    <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        {teacherProfile.teacher_type === 'professional' && (
                          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                            Verified Track 2
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                            {teacherProfile.years_experience ?? 1}
                          </span>
                          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">Years</span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                          Teaching Tenure
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                          Accredited educator
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Directory Status */}
                    <button
                      type="button"
                      onClick={() => {
                        if (teacherProfile.is_published && teacherProfile.id) {
                          window.open(`/teachers/${teacherProfile.id}`, '_blank');
                        } else {
                          setActiveTab('profile');
                        }
                      }}
                      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/90 p-4 sm:p-5 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/80 dark:hover:border-emerald-400/40 hover:shadow-md cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${
                            teacherProfile.is_published
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                              : 'bg-stone-200/50 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                          }`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            teacherProfile.is_published
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {teacherProfile.is_published && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                          )}
                          <span>{teacherProfile.is_published ? 'Live' : 'Draft'}</span>
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                            {teacherProfile.is_published ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                          Directory Status
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                          <span>{teacherProfile.is_published ? 'View public profile' : 'Complete setup to publish'}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Payout Setup */}
                  <ConnectPayoutButton
                    connected={Boolean(
                      teacherProfile.stripe_account_id && teacherProfile.stripe_onboarding_complete,
                    )}
                  />

                  {/* Weekly Availability Schedule */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-black text-stone-950 dark:text-white">
                        Weekly Availability Schedule
                      </h3>
                      <span className="text-xs font-medium text-stone-400">
                        Students can only book inside these open windows
                      </span>
                    </div>
                    <AvailabilityEditor teacherId={teacherProfile.id} />
                  </div>

                  {/* Bookings Section */}
                  {(upcomingBookings.length > 0 || pastBookings.length > 0) && (
                    <div className="space-y-6 pt-2">
                      <BookingsList
                        bookings={upcomingBookings}
                        title="Upcoming Student Lessons"
                        emptyMessage="No upcoming student lessons scheduled."
                        viewerRole="teacher"
                      />
                      <BookingsList
                        bookings={pastBookings}
                        title="Lesson History"
                        emptyMessage="Your past lesson history will appear here."
                        viewerRole="teacher"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
                    <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                      Weekly Availability
                    </h2>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      Configure your recurring weekly teaching slots. Times are converted automatically to students’ local timezones.
                    </p>
                  </div>
                  <AvailabilityEditor teacherId={teacherProfile.id} />
                </div>
              )}

              {/* TAB 3: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
                    <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                      Student Lesson Roster
                    </h2>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      Review all upcoming and past 1-on-1 speaking sessions with students.
                    </p>
                  </div>
                  <BookingsList
                    bookings={upcomingBookings}
                    title="Upcoming Student Lessons"
                    emptyMessage="No upcoming student lessons scheduled."
                    viewerRole="teacher"
                  />
                  <BookingsList
                    bookings={pastBookings}
                    title="Lesson History"
                    emptyMessage="Your past lesson history will appear here."
                    viewerRole="teacher"
                  />
                </div>
              )}

              {/* TAB 4: PAYOUTS */}
              {activeTab === 'payouts' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
                    <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                      Direct Bank Payouts
                    </h2>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      Connect your bank account via Stripe Express to receive direct payouts after each 1-on-1 session is completed.
                    </p>
                  </div>
                  <ConnectPayoutButton
                    connected={Boolean(
                      teacherProfile.stripe_account_id && teacherProfile.stripe_onboarding_complete,
                    )}
                  />
                </div>
              )}
              
              {/* TAB 5: MESSAGES */}
              {activeTab === 'messages' && (
                <DashboardMessagesTab currentUser={{ id: profile.user_id, role: 'teacher' }} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
