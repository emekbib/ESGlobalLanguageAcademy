'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  AlertTriangle,
  Users,
  Clock,
  ShieldCheck,
  Menu,
  X,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CreditCard,
  Video,
  DollarSign,
  Award,
  Calendar,
  XCircle,
} from 'lucide-react';
import AdminSidebar, { type AdminTab } from './admin-sidebar';
import { ApplicationActions, SuspensionButton, ReviewModerationActions } from './admin-controls';
import LogoutModal from '@/components/dashboard/logout-modal';

type TeacherProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  languages_taught: string[] | null;
  hourly_rate: number;
  years_experience: number;
  teacher_type: string;
  application_status: string;
  credentials: string[] | null;
  specialties: string[] | null;
  video_intro_url: string | null;
  is_published: boolean;
  created_at: string;
};

type FlaggedReview = {
  id: string;
  teacher_id: string;
  student_id: string;
  rating: number;
  comment: string;
  flag_reason: string | null;
  flagged_at: string | null;
  created_at: string;
};

type UserAccount = {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at?: string;
};

type Booking = {
  id: string;
  student_id: string;
  teacher_id: string;
  status: string;
  amount_cents: number | null;
  teacher_payout_cents: number | null;
  start_time_utc: string;
  created_at: string;
};

type AdminDashboardShellProps = {
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  pendingApplications: TeacherProfile[];
  faculty: TeacherProfile[];
  flaggedReviews: FlaggedReview[];
  accounts: UserAccount[];
  bookings: Booking[];
  names: Record<string, string>;
  avatars: Record<string, string | null>;
};

export default function AdminDashboardShell({
  profile,
  pendingApplications,
  faculty,
  flaggedReviews,
  accounts,
  bookings,
  names,
  avatars,
}: AdminDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [searchFacultyQuery, setSearchFacultyQuery] = useState('');
  const [searchLearnersQuery, setSearchLearnersQuery] = useState('');

  const pendingCount = pendingApplications.length;
  const flaggedCount = flaggedReviews.length;
  const totalAccounts = accounts.length;
  const learners = accounts.filter((a) => a.role === 'student');

  // Compute booking statistics
  const completedBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  // Compute payouts
  const totalPayoutOwedCents = completedBookings.reduce(
    (sum, b) => sum + (b.teacher_payout_cents || (b.amount_cents ? Math.round(b.amount_cents * 0.8) : 2240)),
    0
  );
  const totalVolumeCents = completedBookings.reduce(
    (sum, b) => sum + (b.amount_cents || 2800),
    0
  );

  // Per teacher stats map
  const teacherStats = new Map<string, { completed: number; cancelled: number; earnedCents: number }>();
  faculty.forEach((t) => {
    teacherStats.set(t.id, { completed: 0, cancelled: 0, earnedCents: 0 });
  });
  bookings.forEach((b) => {
    const stat = teacherStats.get(b.teacher_id);
    if (stat) {
      if (b.status === 'completed' || b.status === 'confirmed') {
        stat.completed += 1;
        stat.earnedCents += b.teacher_payout_cents || (b.amount_cents ? Math.round(b.amount_cents * 0.8) : 2240);
      } else if (b.status === 'cancelled') {
        stat.cancelled += 1;
      }
    }
  });

  // Per learner stats map
  const learnerStats = new Map<string, { completed: number; cancelled: number }>();
  learners.forEach((l) => {
    learnerStats.set(l.user_id, { completed: 0, cancelled: 0 });
  });
  bookings.forEach((b) => {
    const stat = learnerStats.get(b.student_id);
    if (stat) {
      if (b.status === 'completed' || b.status === 'confirmed') {
        stat.completed += 1;
      } else if (b.status === 'cancelled') {
        stat.cancelled += 1;
      }
    }
  });

  const filteredAccounts = accounts.filter((acc) => {
    if (!searchAccountQuery) return true;
    const q = searchAccountQuery.toLowerCase();
    return acc.full_name?.toLowerCase().includes(q) || acc.role?.toLowerCase().includes(q);
  });

  const filteredFaculty = faculty.filter((t) => {
    if (!searchFacultyQuery) return true;
    const q = searchFacultyQuery.toLowerCase();
    const name = names[t.user_id] || '';
    const langs = (t.languages_taught || []).join(' ');
    return name.toLowerCase().includes(q) || langs.toLowerCase().includes(q) || t.teacher_type.toLowerCase().includes(q);
  });

  const filteredLearners = learners.filter((l) => {
    if (!searchLearnersQuery) return true;
    const q = searchLearnersQuery.toLowerCase();
    return l.full_name?.toLowerCase().includes(q) || l.user_id.toLowerCase().includes(q);
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
        pendingTrack2Count={pendingCount}
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
                  { id: 'pending_track2', label: `Pending Track 2 (${pendingCount})`, icon: Clock },
                  { id: 'educators', label: 'Faculty Directory', icon: GraduationCap },
                  { id: 'learners', label: 'Learners Directory', icon: BookOpen },
                  { id: 'payments', label: 'Teacher Payments', icon: CreditCard },
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
      <main className="md:pl-64 transition-all">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
          {/* TAB 0: OPERATIONS OVERVIEW ONLY */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Header Banner */}
              <div className="border-b border-stone-200/80 dark:border-stone-800 pb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Academy Management
                </span>
                <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                  Operations Overview
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                  High-level summary of Track 2 vetting, faculty directory, learners, payouts, and community safety.
                </p>
              </div>

              {/* 4 Metric Cards Strip (Clickable shortcuts) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  onClick={() => setActiveTab('pending_track2')}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Pending Track 2
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                        {pendingCount}
                      </span>
                      <span className="text-xs text-stone-400">Applications</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 ring-1 ring-amber-500/20 group-hover:scale-105 transition-transform">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('educators')}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Total Faculty
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                        {faculty.length}
                      </span>
                      <span className="text-xs text-stone-400">Educators</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 ring-1 ring-blue-500/20 group-hover:scale-105 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('learners')}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Enrolled Learners
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                        {learners.length}
                      </span>
                      <span className="text-xs text-stone-400">Students</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 ring-1 ring-emerald-500/20 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('payments')}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Owed This Month
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                        ${(totalPayoutOwedCents / 100).toFixed(0)}
                      </span>
                      <span className="text-xs text-stone-400">Teacher share</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 ring-1 ring-amber-500/20 group-hover:scale-105 transition-transform">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* High-Level Overview Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-stone-950 dark:text-white">
                      Track 2 Vetting Queue
                    </h3>
                    <span className="rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      {pendingCount} Pending
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    {pendingCount > 0
                      ? `${pendingCount} professional educator(s) have submitted credentials requiring university degree audit.`
                      : 'All educator credentials have been verified. Community tutors are auto-published without delay.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pending_track2')}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-950 dark:bg-stone-100 px-4 py-2 text-xs font-bold text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white transition cursor-pointer"
                  >
                    <span>Inspect Vetting Queue</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-stone-950 dark:text-white">
                      Community Safety &amp; Reviews
                    </h3>
                    <span className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      {flaggedCount} Flags
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    {flaggedCount > 0
                      ? `${flaggedCount} review(s) have been flagged or rated under 3 stars by students or tutors.`
                      : 'All reviews meet community guidelines. No low-rating or flagged feedback pending.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer"
                  >
                    <span>Review Moderation</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PENDING TRACK 2 EDUCATORS */}
          {activeTab === 'pending_track2' && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)] animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                      Pending Track 2 Educators
                    </h2>
                    <span className="rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      {pendingCount} Awaiting Review
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Professional teachers handling high-stakes language (legal, medical, Qene/ቅኔ, advanced registers) requiring credential audit.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {pendingApplications.length ? (
                  pendingApplications.map((app) => {
                    const educatorName = names[app.user_id] || 'Educator Applicant';
                    return (
                      <article
                        key={app.id}
                        className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-lg">
                              {educatorName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-stone-950 dark:text-white text-base">
                                {educatorName}
                              </h3>
                              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                                {(app.languages_taught || []).join(' • ')} · ${app.hourly_rate}/hr · {app.years_experience} yrs exp
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <ApplicationActions teacherId={app.id} />
                          </div>
                        </div>

                        {app.bio && (
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium bg-white dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
                            {app.bio}
                          </p>
                        )}

                        {/* Credentials & Specialties */}
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          {app.credentials && app.credentials.length > 0 && (
                            <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                                <Award className="h-3.5 w-3.5" />
                                Degrees &amp; Certifications
                              </span>
                              <ul className="space-y-1 text-stone-700 dark:text-stone-300 font-medium">
                                {app.credentials.map((cred, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-600">•</span>
                                    <span>{cred}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {app.specialties && app.specialties.length > 0 && (
                            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/40 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">
                                Advanced Teaching Specialties
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {app.specialties.map((spec, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-lg bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {app.video_intro_url && (
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={app.video_intro_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Watch Video Introduction</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <div className="py-10 text-center rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/40">
                    <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
                    <p className="mt-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                      All Track 2 credentials are up to date!
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-400">
                      Community tutors are auto-approved instantly; professional educators will queue here for review.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: FACULTY DIRECTORY */}
          {activeTab === 'educators' && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    Faculty Directory ({faculty.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Track 1 &amp; Track 2 teachers, suspension controls, completed sessions, and cancellations.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchFacultyQuery}
                    onChange={(e) => setSearchFacultyQuery(e.target.value)}
                    placeholder="Search faculty..."
                    className="w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 pl-9 pr-4 py-2 text-xs font-medium placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-6 divide-y divide-stone-100 dark:divide-stone-800">
                {filteredFaculty.length ? (
                  filteredFaculty.map((teacher) => {
                    const name = names[teacher.user_id] || 'Faculty Member';
                    const avatar = avatars[teacher.user_id];
                    const stat = teacherStats.get(teacher.id) || { completed: 0, cancelled: 0, earnedCents: 0 };
                    const userAcc = accounts.find((a) => a.user_id === teacher.user_id);
                    const isSuspended = Boolean(userAcc?.suspended_at);

                    return (
                      <div
                        key={teacher.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                            {avatar ? (
                              <img src={avatar} alt={name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-amber-600 dark:text-amber-400">
                                {name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-display font-bold text-sm text-stone-950 dark:text-white">
                                {name}
                              </p>
                              {teacher.teacher_type === 'professional' ? (
                                <span className="rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                                  Track 2 Verified
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                                  Track 1 Community
                                </span>
                              )}
                              {isSuspended && (
                                <span className="rounded-full bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 px-2 py-0.2 text-[9px] font-bold">
                                  Suspended
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                              {(teacher.languages_taught || []).join(' • ')} · ${teacher.hourly_rate}/50 min
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-stone-400">Lessons</span>
                              <span className="font-bold text-stone-950 dark:text-white">{stat.completed} completed</span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-stone-400">Cancellations</span>
                              <span className="font-bold text-rose-600 dark:text-rose-400">{stat.cancelled}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/teachers/${teacher.id}`}
                              className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
                            >
                              Profile
                            </Link>
                            <SuspensionButton
                              userId={teacher.user_id}
                              suspended={isSuspended}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-xs text-stone-400">No matching faculty found.</p>
                )}
              </div>
            </section>
          )}

          {/* TAB 3: LEARNERS DIRECTORY */}
          {activeTab === 'learners' && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    Learners Directory ({learners.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Student accounts, lesson completion history, cancellations, and access moderation.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchLearnersQuery}
                    onChange={(e) => setSearchLearnersQuery(e.target.value)}
                    placeholder="Search learners..."
                    className="w-full rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 pl-9 pr-4 py-2 text-xs font-medium placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-6 divide-y divide-stone-100 dark:divide-stone-800">
                {filteredLearners.length ? (
                  filteredLearners.map((learner) => {
                    const stat = learnerStats.get(learner.user_id) || { completed: 0, cancelled: 0 };
                    const isSuspended = Boolean(learner.suspended_at);
                    return (
                      <div
                        key={learner.user_id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                            {learner.avatar_url ? (
                              <img src={learner.avatar_url} alt={learner.full_name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-stone-700 dark:text-stone-300">
                                {learner.full_name?.charAt(0) || 'S'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-display font-bold text-sm text-stone-950 dark:text-white">
                                {learner.full_name}
                              </p>
                              {isSuspended && (
                                <span className="rounded-full bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 px-2 py-0.2 text-[9px] font-bold">
                                  Suspended
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 font-mono">
                              ID: {learner.user_id.slice(0, 16)}...
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-stone-400">Completed</span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">{stat.completed} sessions</span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-stone-400">Cancelled</span>
                              <span className="font-bold text-rose-600 dark:text-rose-400">{stat.cancelled}</span>
                            </div>
                          </div>

                          <SuspensionButton
                            userId={learner.user_id}
                            suspended={isSuspended}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-xs text-stone-400">No matching learners found.</p>
                )}
              </div>
            </section>
          )}

          {/* TAB 4: TEACHER PAYMENTS */}
          {activeTab === 'payments' && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    Teacher Payments &amp; Balances
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Gross volume, platform commissions (20%), net educator earnings, and monthly payout balances.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 px-4 py-2 text-right">
                    <span className="block text-[10px] uppercase font-bold text-stone-400">Gross Volume</span>
                    <span className="font-display font-black text-sm text-stone-950 dark:text-white">
                      ${(totalVolumeCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-right">
                    <span className="block text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Owed This Month</span>
                    <span className="font-display font-black text-sm text-amber-900 dark:text-amber-200">
                      ${(totalPayoutOwedCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-400">
                      <th className="pb-3 font-bold">Educator</th>
                      <th className="pb-3 font-bold">Rate</th>
                      <th className="pb-3 font-bold">Completed Lessons</th>
                      <th className="pb-3 font-bold">Gross Billed</th>
                      <th className="pb-3 font-bold">Net Payout Owed</th>
                      <th className="pb-3 font-bold">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {faculty.map((teacher) => {
                      const name = names[teacher.user_id] || 'Faculty Member';
                      const stat = teacherStats.get(teacher.id) || { completed: 0, cancelled: 0, earnedCents: 0 };
                      const grossBilled = Math.round(stat.earnedCents / 0.8);
                      return (
                        <tr key={teacher.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition">
                          <td className="py-3.5 font-bold text-stone-950 dark:text-white">
                            {name}
                          </td>
                          <td className="py-3.5 text-stone-600 dark:text-stone-300 font-medium">
                            ${teacher.hourly_rate}/hr
                          </td>
                          <td className="py-3.5 font-bold text-stone-950 dark:text-white">
                            {stat.completed} sessions
                          </td>
                          <td className="py-3.5 text-stone-600 dark:text-stone-300 font-medium">
                            ${(grossBilled / 100).toFixed(2)}
                          </td>
                          <td className="py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
                            ${(stat.earnedCents / 100).toFixed(2)}
                          </td>
                          <td className="py-3.5">
                            <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                              Ready for Transfer
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: FLAGGED REVIEWS */}
          {activeTab === 'reviews' && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    Flagged Reviews &amp; Moderation
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {flaggedCount} item{flaggedCount !== 1 ? 's' : ''} reported or rated below 3 stars
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
                  flaggedReviews.map((review) => {
                    const studentName = names[review.student_id] || 'Student';
                    const isLowRating = review.rating < 3;
                    return (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold text-stone-950 dark:text-white">
                              ★ {review.rating}/5 from {studentName}
                            </span>
                            {isLowRating && (
                              <span className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2 py-0.2 text-[9px] font-bold">
                                Low Rating (&lt; 3 Stars)
                              </span>
                            )}
                          </div>
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
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
                    <p className="mt-2 text-xs font-semibold text-stone-400">
                      All reviews are clear. No flags or ratings below 3 stars pending.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 6: USER ACCOUNTS (Role dropdown removed, replaced with static role badge) */}
          {activeTab === 'accounts' && (
            <section className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                    User Accounts &amp; Access Controls
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Audit accounts, inspect roles, and enact administrative suspensions
                  </p>
                </div>

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
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              account.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40'
                                : account.role === 'teacher'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/40'
                                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                            }`}
                          >
                            {account.role}
                          </span>
                          {account.suspended_at && (
                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                              Suspended
                            </span>
                          )}
                        </div>
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
