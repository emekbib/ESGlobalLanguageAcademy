'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  AlertTriangle,
  Users,
  Clock,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import AdminSidebar, { type AdminTab } from './admin-sidebar';
import { ApplicationActions, SuspensionButton, ReviewModerationActions } from './admin-controls';
import LogoutModal from '@/components/dashboard/logout-modal';

type TeacherApplication = {
  id: string;
  user_id: string;
  bio: string | null;
  languages_taught: string[] | null;
  hourly_rate: number;
  years_experience: number;
  application_status: string;
  created_at: string;
};

type FlaggedReview = {
  id: string;
  teacher_id: string;
  student_id: string;
  rating: number;
  comment: string;
  flag_reason: string | null;
  created_at: string;
};

type UserAccount = {
  user_id: string;
  full_name: string;
  role: string;
  suspended_at: string | null;
  suspension_reason: string | null;
};

type AdminDashboardShellProps = {
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  applications: TeacherApplication[];
  flaggedReviews: FlaggedReview[];
  accounts: UserAccount[];
  names: Record<string, string>;
};

export default function AdminDashboardShell({
  profile,
  applications,
  flaggedReviews,
  accounts,
  names,
}: AdminDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [searchAccountQuery, setSearchAccountQuery] = useState('');

  const pendingCount = applications.length;
  const flaggedCount = flaggedReviews.length;
  const totalAccounts = accounts.length;

  const filteredAccounts = accounts.filter((acc) => {
    if (!searchAccountQuery) return true;
    const q = searchAccountQuery.toLowerCase();
    return (
      acc.full_name?.toLowerCase().includes(q) ||
      acc.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Desktop Luxury Sidebar */}
      <AdminSidebar
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        onOpenLogout={() => setLogoutModalOpen(true)}
        pendingCount={pendingCount}
        flaggedCount={flaggedCount}
        totalAccounts={totalAccounts}
      />

      {/* Mobile Top Navigation Bar */}
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 px-4 backdrop-blur-md md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-950 dark:bg-stone-800 text-amber-300">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-stone-950 dark:text-white">
                ESGlobal
              </span>
              <span className="rounded-md bg-amber-500/10 px-1 py-0.2 text-[9px] font-bold uppercase text-amber-800 dark:text-amber-300">
                Admin
              </span>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer Slide-over */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white dark:bg-stone-900 p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-950 dark:bg-stone-800 text-amber-300">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-stone-950 dark:text-white">
                    ESGlobal Admin
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-1.5">
                {[
                  { id: 'overview', label: 'Operations Overview', icon: SlidersHorizontal },
                  { id: 'applications', label: `Applications (${pendingCount})`, icon: GraduationCap },
                  { id: 'reviews', label: `Flagged Reviews (${flaggedCount})`, icon: AlertTriangle },
                  { id: 'accounts', label: `User Accounts (${totalAccounts})`, icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id as AdminTab);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold ${
                        isActive
                          ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoutModalOpen(true);
                }}
                className="w-full rounded-xl bg-rose-50 dark:bg-rose-950/40 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:pl-72 transition-all">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Academy Management
              </span>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                Operations &amp; Moderation
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                Vetting educators, review moderation, and account permissions for ES Global Language Academy.
              </p>
            </div>

            {/* Quick Segmented View Tabs */}
            <div className="inline-flex max-w-full overflow-x-auto rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-1 shadow-sm no-scrollbar">
              {[
                { id: 'overview', label: 'All Operations' },
                { id: 'applications', label: `Applications (${pendingCount})` },
                { id: 'reviews', label: `Flags (${flaggedCount})` },
                { id: 'accounts', label: `Users (${totalAccounts})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3-Card Operational Metrics Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              onClick={() => setActiveTab('applications')}
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Pending Educators
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                    {pendingCount}
                  </span>
                  <span className="text-xs text-stone-400">Applications</span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300 ring-1 ring-amber-500/20 group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('reviews')}
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Flagged Reviews
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                    {flaggedCount}
                  </span>
                  <span className="text-xs text-stone-400">Needing Audit</span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 ring-1 ring-rose-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('accounts')}
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Total Accounts
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                    {totalAccounts}
                  </span>
                  <span className="text-xs text-stone-400">Users</span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 ring-1 ring-indigo-500/20 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Tab Content: Applications or Overview */}
          {(activeTab === 'overview' || activeTab === 'applications') && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    Teacher Applications
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {pendingCount} candidate{pendingCount !== 1 ? 's' : ''} awaiting accreditation
                  </p>
                </div>
                {activeTab === 'overview' && pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {applications.length ? (
                  applications.map((app) => (
                    <article
                      key={app.id}
                      className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 transition hover:border-stone-300 dark:hover:border-stone-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-stone-950 dark:text-white text-base">
                            {names[app.user_id] ?? 'Educator Applicant'}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
                            {app.languages_taught?.join(', ') || 'Languages not specified'} · ${app.hourly_rate}/50 min · {app.years_experience} yrs exp
                          </p>
                        </div>
                        <ApplicationActions teacherId={app.id} />
                      </div>
                      {app.bio && (
                        <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                          {app.bio}
                        </p>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <UserCheck className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
                    <p className="mt-2 text-xs font-semibold text-stone-400">
                      No pending educator applications.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Tab Content: Flagged Reviews or Overview */}
          {(activeTab === 'overview' || activeTab === 'reviews') && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    Flagged Reviews &amp; Moderation
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {flaggedCount} item{flaggedCount !== 1 ? 's' : ''} reported by students or educators
                  </p>
                </div>
                {activeTab === 'overview' && flaggedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {flaggedReviews.length ? (
                  flaggedReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-display text-sm font-bold text-stone-950 dark:text-white">
                          ★ {review.rating}/5 from {names[review.student_id] ?? 'Student'}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                        {review.comment}
                      </p>
                      {review.flag_reason && (
                        <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                          Flag reason: {review.flag_reason}
                        </p>
                      )}
                      <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-stone-400">
                          Moderation Action
                        </span>
                        <ReviewModerationActions reviewId={review.id} />
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
                    <p className="mt-2 text-xs font-semibold text-stone-400">
                      All reviews are clear. No flags pending.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Tab Content: User Accounts or Overview */}
          {(activeTab === 'overview' || activeTab === 'accounts') && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    User Accounts &amp; Access Controls
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Audit accounts, inspect roles, or enact administrative suspensions
                  </p>
                </div>

                {/* Instant User Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchAccountQuery}
                    onChange={(e) => setSearchAccountQuery(e.target.value)}
                    placeholder="Search accounts..."
                    className="w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 pl-9 pr-4 py-2 text-xs font-medium placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-6 divide-y divide-stone-100 dark:divide-stone-800">
                {filteredAccounts.length ? (
                  filteredAccounts.map((account) => (
                    <div
                      key={account.user_id}
                      className="flex items-center justify-between gap-4 py-4 transition hover:bg-stone-50/50 dark:hover:bg-stone-800/20 px-2 rounded-xl"
                    >
                      <div>
                        <p className="font-display font-bold text-sm text-stone-950 dark:text-white">
                          {account.full_name}
                        </p>
                        <p className="text-xs capitalize text-stone-400 mt-0.5">
                          {account.role}
                          {account.suspended_at && (
                            <span className="ml-2 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                              Suspended
                            </span>
                          )}
                        </p>
                      </div>

                      <SuspensionButton
                        userId={account.user_id}
                        suspended={Boolean(account.suspended_at)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-xs text-stone-400">
                    No matching accounts found.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
