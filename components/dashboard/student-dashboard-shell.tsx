'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import DashboardSidebar from './dashboard-sidebar';
import DashboardHeader from './dashboard-header';
import DashboardMetrics from './dashboard-metrics';
import DashboardSpotlight from './dashboard-spotlight';
import DashboardTeachersTab from './dashboard-teachers-tab';
import DashboardTutorsTab from './dashboard-tutors-tab';
import DashboardSettingsTab from './dashboard-settings-tab';
import LogoutModal from './logout-modal';
import BookingsList from '@/components/student/bookings-list';
import BookingCard from '@/components/teacher/booking-card';
import { SAMPLE_TEACHERS, type SampleTeacherDetail } from '@/lib/data/sample-teachers';

type BookingItem = {
  id: string;
  student_id: string;
  teacher_id: string;
  start_time_utc: string;
  end_time_utc: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  teacher_name: string;
  teacher_avatar: string | null;
};

type StudentDashboardShellProps = {
  profile: {
    role: string;
    full_name: string;
    avatar_url: string | null;
  };
  upcoming: BookingItem[];
  past: BookingItem[];
  tutors: any[];
};

export default function StudentDashboardShell({
  profile,
  upcoming,
  past,
  tutors,
}: StudentDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'teachers' | 'tutors' | 'settings'>('lessons');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] = useState<SampleTeacherDetail | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success' || params.get('booking') === 'confirmed') {
        const teacherName = params.get('teacher') || 'your educator';
        setSuccessBanner(`Booking confirmed with ${teacherName}! Your 1-on-1 speaking session is scheduled.`);
      }
    }
  }, []);

  const nextBooking = upcoming.length > 0 ? upcoming[0] : null;
  const completedCount = past.filter((b) => b.status === 'completed').length;
  const uniqueTeachersCount = Array.from(new Set([...upcoming, ...past].map((b) => b.teacher_name))).length;

  const featuredTeachers = SAMPLE_TEACHERS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Intro.co Style Sidebar Navigation */}
      <DashboardSidebar
        fullName={profile.full_name || 'Student'}
        avatarUrl={profile.avatar_url}
        role={profile.role}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen md:pl-72">
        {/* Intro.co Style Top Bar */}
        <DashboardHeader
          fullName={profile.full_name || 'Student'}
          avatarUrl={profile.avatar_url}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          onOpenLogout={() => setLogoutModalOpen(true)}
        />

        <main className="mx-auto w-full max-w-6xl px-6 py-5 sm:px-10 space-y-5">
          {/* TAB 1: MY LESSONS & SPOTLIGHT */}
          {activeTab === 'lessons' && (
            <div className="space-y-4 animate-fade-in">
              {/* Checkout / Booking Success Notification */}
              {successBanner && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-300/80 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-emerald-900 dark:text-emerald-200 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs font-bold sm:text-sm">{successBanner}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessBanner(null)}
                    className="rounded-lg p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Header Greeting */}
              <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Learner Portal
                </span>
                <h1 className="mt-0.5 font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                  Welcome back, {profile.full_name}
                </h1>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Manage your scheduled 1-on-1 video lessons and connect with native educators.
                </p>
              </div>

              {/* Intro.co Luxury Hero Spotlight Card (Positioned prominent and high) */}
              <DashboardSpotlight
                nextBooking={nextBooking}
                onNavigateTeachers={() => setActiveTab('teachers')}
              />

              {/* Intro.co Luxury Metric Cards */}
              <DashboardMetrics
                upcomingCount={upcoming.length}
                completedCount={completedCount}
                tutorsCount={uniqueTeachersCount}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />

              {/* Featured Educators */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Top Faculty
                    </span>
                    <h2 className="font-display text-xl font-black tracking-tight text-stone-950 dark:text-white">
                      Featured Native Educators
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('teachers')}
                    className="text-xs font-bold text-stone-950 dark:text-white hover:underline transition"
                  >
                    View all tutors →
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {featuredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3.5">
                          {teacher.avatarUrl ? (
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.name}
                              className="h-13 w-13 rounded-2xl object-cover ring-2 ring-stone-200 dark:ring-stone-700 shadow-sm"
                            />
                          ) : (
                            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-sm font-bold text-amber-300 shadow-sm">
                              {teacher.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="truncate font-display text-sm font-bold text-stone-950 dark:text-white">
                              {teacher.name}
                            </h4>
                            <p className="truncate text-xs text-stone-400 dark:text-stone-500 font-medium">
                              {teacher.languages.join(' · ')}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{teacher.rating}</span>
                              <span className="text-stone-400 dark:text-stone-500 font-normal">({teacher.lessonsTaught} sessions)</span>
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                          {teacher.headline}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3">
                        <span className="font-display text-base font-black text-stone-950 dark:text-white">
                          ${teacher.hourlyRate}
                          <span className="text-xs font-normal text-stone-400 dark:text-stone-500">/hr</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedTeacherForBooking(teacher)}
                          className="rounded-2xl bg-stone-950 dark:bg-stone-100 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white active:scale-95"
                        >
                          Book Lesson
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booked Sessions (Upcoming & History) */}
              <div className="space-y-6 pt-2">
                <BookingsList
                  bookings={upcoming}
                  title="Upcoming 1-on-1 Lessons"
                  emptyMessage="You have no upcoming lessons scheduled. Book a session with a native tutor above."
                  viewerRole="student"
                />

                {past.length > 0 && (
                  <BookingsList
                    bookings={past}
                    title="Lesson History"
                    emptyMessage="Your past completed sessions will appear here."
                    viewerRole="student"
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FIND TEACHERS */}
          {activeTab === 'teachers' && <DashboardTeachersTab />}

          {/* TAB 3: MY TUTORS */}
          {activeTab === 'tutors' && (
            <DashboardTutorsTab tutors={tutors} onFindMore={() => setActiveTab('teachers')} />
          )}

          {/* TAB 4: PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <DashboardSettingsTab
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
            />
          )}
        </main>
      </div>

      {/* In-Dashboard Quick Booking Modal */}
      {selectedTeacherForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedTeacherForBooking(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 pb-4 border-b border-stone-100 dark:border-stone-800">
              <img
                src={selectedTeacherForBooking.avatarUrl || undefined}
                alt={selectedTeacherForBooking.name}
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-stone-200 dark:ring-stone-700 shadow-sm"
              />
              <div>
                <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                  {selectedTeacherForBooking.name}
                </h3>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                  {selectedTeacherForBooking.languages.join(' · ')} · ${selectedTeacherForBooking.hourlyRate}/hr
                </p>
              </div>
            </div>

            <div className="mt-4">
              <BookingCard
                teacherId={selectedTeacherForBooking.id}
                hourlyRate={selectedTeacherForBooking.hourlyRate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
