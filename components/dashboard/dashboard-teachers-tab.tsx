'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  Bookmark,
  Calendar,
  X,
  BadgeCheck,
  MessageSquare,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useTeachers } from '@/hooks/use-teachers';
import type { TeacherCardData } from '@/components/teacher/teacher-card';
import BookingCard from '@/components/teacher/booking-card';

const LANGUAGES = [
  'All',
  'Amharic',
  'Tigrigna',
  'Afaan Oromo',
  'Somali',
];

export default function DashboardTeachersTab() {
  const { teachers, loading } = useTeachers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] = useState<TeacherCardData | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesLang =
        selectedLanguage === 'All' ||
        (teacher.languages ?? []).some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.languages ?? []).some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.headline && teacher.headline.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLang && matchesSearch;
    });
  }, [teachers, searchQuery, selectedLanguage]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Section with Right-Aligned Filter Pills */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-stone-200/80 dark:border-stone-800 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Native Faculty Directory
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
            Book 1-on-1 Lessons
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
            Select native educators, compare hourly rates, and schedule private video sessions.
          </p>
        </div>

        {/* Language Filter Pills */}
        <div className="flex flex-wrap gap-1.5 self-start lg:self-auto">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm'
                    : 'border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by instructor name, dialect, grammar, or specialty…"
          className="h-12 w-full rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 pl-11 pr-4 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm outline-none transition focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Loader2 className="h-7 w-7 animate-spin text-stone-900 dark:text-stone-100" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Loading academy faculty…
          </p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-stone-900 dark:text-white">No educators found</p>
          <p className="mt-1 text-xs text-stone-400">Try adjusting your language filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => {
            const isBookmarked = !!bookmarkedIds[teacher.id];
            const avgRating = teacher.rating > 0 ? Number(teacher.rating).toFixed(1) : '5.0';

            return (
              <div
                key={teacher.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition hover:shadow-md"
              >
                <div>
                  {/* Portrait Photo Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    {teacher.avatarUrl ? (
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-950 text-4xl font-black text-amber-300">
                        {teacher.name.charAt(0)}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(teacher.id)}
                      className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition ${
                        isBookmarked
                          ? 'bg-stone-950 dark:bg-stone-800 text-amber-300'
                          : 'bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800'
                      }`}
                      aria-label="Bookmark tutor"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>

                    {/* Rate */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="font-display text-xl font-black tracking-tight">
                        ${teacher.hourlyRate}
                      </span>
                      <span className="text-xs text-stone-300 font-medium"> / 50 min</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-stone-900 dark:text-white group-hover:text-stone-700 dark:group-hover:text-stone-300 transition">
                        {teacher.name}
                      </h3>
                      {teacher.teacherType === 'professional' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Track 2 Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          Community Tutor
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                      {teacher.headline || `${(teacher.languages ?? []).join(' & ')} Native Speaking Instruction`}
                    </p>

                    {/* Languages */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(teacher.languages ?? []).map((lang) => (
                        <span
                          key={lang}
                          className="rounded-lg bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    {/* Rating & Sessions */}
                    <div className="mt-3 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3 text-xs">
                      <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{avgRating}</span>
                        <span className="text-[11px] font-normal text-stone-400">
                          ({teacher.lessonsTaught ?? 0} sessions)
                        </span>
                      </div>

                      <Link
                        href={`/teachers/${teacher.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white transition"
                      >
                        Profile
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Message & Book */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/dashboard?tab=messages`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-sm transition hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-stone-500" />
                    Message
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedTeacherForBooking(teacher)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-stone-950 dark:bg-stone-100 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5 text-amber-300 dark:text-stone-950" />
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {selectedTeacherForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTeacherForBooking(null)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                {selectedTeacherForBooking.avatarUrl ? (
                  <img
                    src={selectedTeacherForBooking.avatarUrl}
                    alt={selectedTeacherForBooking.name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-stone-200 dark:ring-stone-700"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-amber-300 font-bold">
                    {selectedTeacherForBooking.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-display font-bold text-stone-900 dark:text-white text-base">
                    Book Lesson with {selectedTeacherForBooking.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    ${selectedTeacherForBooking.hourlyRate} / 50 min session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherForBooking(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto">
              <BookingCard
                teacherId={selectedTeacherForBooking.id}
                hourlyRate={selectedTeacherForBooking.hourlyRate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
