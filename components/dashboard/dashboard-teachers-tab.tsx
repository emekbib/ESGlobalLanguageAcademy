'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Bookmark,
  Calendar,
  X,
  BadgeCheck,
} from 'lucide-react';
import { SAMPLE_TEACHERS, type SampleTeacherDetail } from '@/lib/data/sample-teachers';
import BookingCard from '@/components/teacher/booking-card';

const LANGUAGES = [
  'All',
  'Amharic',
  'German',
  'English',
  'French',
  'Arabic',
  'Afan Oromo',
  'Italian',
  'Mandarin',
];

export default function DashboardTeachersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] = useState<SampleTeacherDetail | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTeachers = useMemo(() => {
    return SAMPLE_TEACHERS.filter((teacher) => {
      const matchesLang =
        selectedLanguage === 'All' ||
        teacher.languages.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.headline && teacher.headline.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLang && matchesSearch;
    });
  }, [searchQuery, selectedLanguage]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Section with Right-Aligned Filter Pills */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Vetted Native Faculty
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
            Book 1-on-1 Lessons
          </h2>
          <p className="mt-1 text-xs text-stone-500 font-medium">
            Select verified native educators, compare hourly rates, and schedule private video sessions.
          </p>
        </div>

        {/* Filter Segment Pill Bar (Intro.co style) */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-stone-100 p-1 border border-stone-200/80 self-start lg:self-auto">
          {LANGUAGES.slice(0, 6).map((lang) => {
            const isSelected = selectedLanguage.toLowerCase() === lang.toLowerCase();
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                  isSelected
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-white'
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
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by teacher name, language, or exam prep (e.g. Goethe, IELTS, Fidel)…"
          className="w-full rounded-full border border-stone-200 bg-white py-3.5 pl-12 pr-4 text-xs font-medium text-stone-800 placeholder-stone-400 shadow-sm transition focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Teachers Grid: Intro.co Luxury Expert Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => {
          const isBookmarked = !!bookmarkedIds[teacher.id];

          return (
            <div
              key={teacher.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img
                    src={teacher.avatarUrl || undefined}
                    alt={teacher.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-stone-900 shadow-sm backdrop-blur-md">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{teacher.rating.toFixed(1)}</span>
                    <span className="text-stone-400 font-normal">({teacher.lessonsTaught})</span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(teacher.id)}
                    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition ${
                      isBookmarked
                        ? 'bg-stone-950 text-amber-300'
                        : 'bg-white/90 text-stone-700 hover:bg-white'
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
                    <h3 className="font-display text-base font-bold text-stone-900 group-hover:text-stone-700 transition">
                      {teacher.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs text-stone-500 leading-relaxed font-medium">
                    {teacher.headline}
                  </p>

                  {/* Languages */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {teacher.languages.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForBooking(teacher)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800 active:scale-95"
                >
                  <Calendar className="h-3.5 w-3.5 text-amber-300" />
                  Book 1-on-1 Lesson
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedTeacherForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTeacherForBooking(null)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacherForBooking.avatarUrl || undefined}
                  alt={selectedTeacherForBooking.name}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-display font-bold text-stone-900 text-base">
                    Book Lesson with {selectedTeacherForBooking.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    ${selectedTeacherForBooking.hourlyRate} / 50 min session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherForBooking(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100"
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
