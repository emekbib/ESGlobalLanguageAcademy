'use client';

import { useState, useEffect, useCallback } from 'react';
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
import DashboardMessagesTab from './dashboard-messages-tab';
import DashboardPaymentsTab from './dashboard-payments-tab';
import LogoutModal from './logout-modal';
import BookingsList from '@/components/student/bookings-list';
import BookingCard from '@/components/teacher/booking-card';
import { SAMPLE_TEACHERS, type SampleTeacherDetail } from '@/lib/data/sample-teachers';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useMessageNotifications } from '@/hooks/use-message-notifications';

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
    user_id: string;
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
  const [activeTab, setActiveTab] = useState<
    'lessons' | 'teachers' | 'tutors' | 'settings' | 'messages' | 'payments'
  >('lessons');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] =
    useState<SampleTeacherDetail | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Live state synchronized with Supabase
  const [liveUpcoming, setLiveUpcoming] = useState<BookingItem[]>(upcoming);
  const [livePast, setLivePast] = useState<BookingItem[]>(past);
  const [liveTutors, setLiveTutors] = useState<any[]>(tutors);
  const { unreadCount, clearUnread } = useMessageNotifications({
    userId: profile.user_id,
    activeTab,
    onOpenMessages: () => setActiveTab('messages'),
  });

  useEffect(() => {
    if (activeTab === 'messages') {
      clearUnread();
    }
  }, [activeTab, clearUnread]);

  const supabase = createSupabaseBrowserClient();

  const fetchLiveBookings = useCallback(async () => {
    try {
      const { data: bks } = await supabase
        .from('bookings')
        .select('id, student_id, teacher_id, start_time_utc, end_time_utc, status, created_at')
        .eq('student_id', profile.user_id)
        .order('start_time_utc', { ascending: true });

      if (bks) {
        const tIds = Array.from(new Set(bks.map((b) => b.teacher_id)));
        let { data: tProfiles } = tIds.length
          ? await supabase
              .from('teacher_profiles')
              .select('id, user_id, languages_taught, hourly_rate')
              .in('id', tIds)
          : { data: [] };

        const uIds = (tProfiles ?? []).map((tp) => tp.user_id);
        const { data: uProfiles } = uIds.length
          ? await supabase
              .from('profiles')
              .select('user_id, full_name, avatar_url')
              .in('user_id', uIds)
          : { data: [] };

        const tpMap = new Map((tProfiles ?? []).map((tp) => [tp.id, tp]));
        const upMap = new Map((uProfiles ?? []).map((up) => [up.user_id, up]));

        const enriched: BookingItem[] = bks.map((b) => {
          const tp = tpMap.get(b.teacher_id);
          const up = tp ? upMap.get(tp.user_id) : null;
          return {
            ...b,
            status: b.status as any,
            teacher_name: up?.full_name ?? 'Teacher',
            teacher_avatar: up?.avatar_url ?? null,
          };
        });

        const now = new Date();
        const nextUpcoming = enriched.filter(
          (b) => new Date(b.start_time_utc) >= now && b.status !== 'cancelled'
        );
        const nextPast = enriched.filter(
          (b) => new Date(b.start_time_utc) < now || b.status === 'cancelled'
        );

        setLiveUpcoming(nextUpcoming);
        setLivePast(nextPast);

        if (tProfiles && tProfiles.length > 0) {
          const updatedTutors = tProfiles.map((t) => {
            const up = upMap.get(t.user_id);
            return {
              id: t.id,
              userId: t.user_id,
              name: up?.full_name ?? 'Native Educator',
              avatarUrl: up?.avatar_url ?? null,
              languages: t.languages_taught ?? [],
              hourlyRate: t.hourly_rate ?? 25,
              rating: 5.0,
              lessonsTaught: bks.filter((b) => b.teacher_id === t.id && b.status === 'completed')
                .length,
            };
          });
          setLiveTutors(updatedTutors);
        }
      }
    } catch (err) {
      console.warn('Live bookings sync notice:', err);
    }
  }, [profile.user_id, supabase]);

  useEffect(() => {
    setLiveUpcoming(upcoming);
    setLivePast(past);
    setLiveTutors(tutors);
  }, [upcoming, past, tutors]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (
        tabParam &&
        ['lessons', 'teachers', 'tutors', 'settings', 'messages', 'payments'].includes(tabParam)
      ) {
        setActiveTab(tabParam as any);
      }
      if (params.get('payment') === 'success' || params.get('booking') === 'confirmed') {
        const teacherName = params.get('teacher') || 'your educator';
        setSuccessBanner(
          `Booking confirmed with ${teacherName}! Your 1-on-1 speaking session is scheduled.`
        );
        void fetchLiveBookings();
      }
    }
  }, [fetchLiveBookings]);

  // Realtime subscription for instant booking updates
  useEffect(() => {
    const channel = supabase
      .channel(`student_bookings_sync_${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `student_id=eq.${profile.user_id}`,
        },
        () => {
          void fetchLiveBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.user_id, fetchLiveBookings, supabase]);

  const nextBooking = liveUpcoming.length > 0 ? liveUpcoming[0] : null;
  const completedCount = livePast.filter((b) => b.status === 'completed').length;
  const uniqueTeachersCount = Array.from(
    new Set([...liveUpcoming, ...livePast].map((b) => b.teacher_name))
  ).length;

  const featuredTeachers = SAMPLE_TEACHERS.slice(0, 3);

  return (
    <div
      className={`bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 ${
        activeTab === 'messages' ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Intro.co Style Sidebar Navigation */}
      <DashboardSidebar
        fullName={profile.full_name || 'Student'}
        avatarUrl={profile.avatar_url}
        role={profile.role}
        activeTab={activeTab}
        unreadMessagesCount={unreadCount}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col md:pl-72 w-full ${
          activeTab === 'messages' ? 'h-screen overflow-hidden' : 'min-h-screen'
        }`}
      >
        {/* Intro.co Style Top Bar */}
        <DashboardHeader
          fullName={profile.full_name || 'Student'}
          avatarUrl={profile.avatar_url}
          activeTab={activeTab}
          unreadMessagesCount={unreadCount}
          onTabChange={(tab) => setActiveTab(tab as any)}
          onOpenLogout={() => setLogoutModalOpen(true)}
        />

        <main
          className={
            activeTab === 'messages'
              ? 'flex-1 overflow-hidden w-full flex flex-col p-0'
              : 'mx-auto w-full max-w-6xl px-6 py-5 sm:px-10 space-y-5'
          }
          style={activeTab === 'messages' ? { height: 'calc(100vh - 4.5rem)' } : undefined}
        >
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
                upcomingCount={liveUpcoming.length}
                completedCount={completedCount}
                tutorsCount={Math.max(uniqueTeachersCount, liveTutors.length)}
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
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800/90 bg-white dark:bg-stone-900/95 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xl"
                    >
                      <div>
                        {/* Portrait Photo Header - Uniform compact height matching the pink background photo */}
                        <div className="relative aspect-[4/3.2] w-full overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
                          {teacher.avatarUrl ? (
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.name}
                              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-stone-950 text-4xl font-black text-amber-300">
                              {teacher.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Ample Text Space for Headline */}
                        <p className="mt-3.5 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                          {teacher.headline}
                        </p>
                      </div>

                      {/* Bottom Pricing & Action Bar */}
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 pt-3.5">
                        <span className="font-display text-base font-black text-stone-950 dark:text-white">
                          ${teacher.hourlyRate}
                          <span className="text-xs font-normal text-stone-400 dark:text-stone-500">
                            /hr
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedTeacherForBooking(teacher)}
                          className="rounded-xl bg-stone-950 dark:bg-stone-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 cursor-pointer"
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
                  bookings={liveUpcoming}
                  title="Upcoming 1-on-1 Lessons"
                  emptyMessage="You have no upcoming lessons scheduled. Book a session with a native tutor above."
                  viewerRole="student"
                />

                {livePast.length > 0 && (
                  <BookingsList
                    bookings={livePast}
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
            <DashboardTutorsTab
              tutors={liveTutors}
              onFindMore={() => setActiveTab('teachers')}
            />
          )}

          {/* TAB 4: PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <DashboardSettingsTab
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
            />
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <DashboardMessagesTab currentUser={{ id: profile.user_id, role: 'student' }} />
          )}

          {/* TAB 6: PAYMENTS */}
          {activeTab === 'payments' && (
            <DashboardPaymentsTab
              role="student"
              payments={livePast.map((b) => ({
                id: b.id,
                date: b.created_at,
                amount: (b as any).amount_cents ? (b as any).amount_cents / 100 : 25,
                status: b.status === 'cancelled' ? 'refunded' : 'paid',
                description: `Lesson with ${b.teacher_name}`,
              }))}
            />
          )}
        </main>
      </div>

      {/* Booking Drawer for Selected Featured Teacher */}
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
                  Book with {selectedTeacherForBooking.name}
                </h3>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                  {selectedTeacherForBooking.languages.join(' · ')} · $
                  {selectedTeacherForBooking.hourlyRate} / 50 min
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
      <LogoutModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />
    </div>
  );
}
