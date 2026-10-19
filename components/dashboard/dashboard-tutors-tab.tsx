'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Star,
  Calendar,
  Search,
  BadgeCheck,
  MessageSquare,
} from 'lucide-react';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';
import BookingCard from '@/components/teacher/booking-card';

export default function DashboardTutorsTab({
  tutors,
  onFindMore,
}: {
  tutors: any[];
  onFindMore: () => void;
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const cleanName = (n: string) =>
    (n || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z0-9]/g, '').trim();

  const rawList = tutors && tutors.length > 0 ? tutors : SAMPLE_TEACHERS.slice(0, 3);
  const seen = new Set<string>();
  const myTutors = rawList.filter((t: any) => {
    const key = cleanName(t.name);
    if (!key || key === 'not' || key.length < 3 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const selectedTeacher = myTutors.find((t: any) => t.id === selectedTeacherId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Personal Faculty
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
            My Tutors
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
            Educators you have scheduled lessons with or saved to your personal faculty list.
          </p>
        </div>
        <button
          type="button"
          onClick={onFindMore}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 px-4 py-2 text-xs font-bold text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-amber-300 dark:text-stone-950" />
          Browse Faculty
        </button>
      </div>

      {/* Tutors List: Intro.co Expert Cards */}
      <div className="space-y-4">
        {myTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              {tutor.avatarUrl ? (
                <img
                  src={tutor.avatarUrl}
                  alt={tutor.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-stone-200 dark:ring-stone-700 shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 font-bold text-xl ring-2 ring-stone-200 dark:ring-stone-700 shadow-sm">
                  {tutor.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-stone-950 dark:text-white">
                    {tutor.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800">
                    <BadgeCheck className="h-3 w-3" />
                    Active Mentor
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {tutor.languages.join(' & ')}{' '}Instructor · ${tutor.hourlyRate} / 50 min
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                  {tutor.rating !== null && tutor.rating !== undefined ? (
                    <>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-amber-600 dark:text-amber-400">{tutor.rating}</span>
                      <span className="text-stone-400 dark:text-stone-500">{` (${tutor.lessonsTaught} sessions)`}</span>
                    </>
                  ) : (
                    <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-stone-500 dark:text-stone-400">
                      {tutor.lessonsTaught > 0 ? `${tutor.lessonsTaught} sessions` : 'New Educator'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/dashboard?tab=messages&contactId=${tutor.userId || tutor.id}`}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-3 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition"
              >
                <MessageSquare className="h-3.5 w-3.5 text-stone-500" />
                Message
              </Link>
              <button
                type="button"
                onClick={() => setSelectedTeacherId(tutor.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 dark:bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5 text-amber-300 dark:text-stone-950" />
                Book Next Lesson
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Booking Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-150 dark:border-stone-800 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Select Lesson Time
                </span>
                <h3 className="font-display text-xl font-bold text-stone-950 dark:text-white">
                  Book 1-on-1 with {selectedTeacher.name}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedTeacher.languages.join(' · ')} · ${selectedTeacher.hourlyRate} / 50 min
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                ✕
              </button>
            </div>

            <BookingCard
              teacherId={selectedTeacher.id}
              hourlyRate={selectedTeacher.hourlyRate}
              teacherType="professional"
            />
          </div>
        </div>
      )}
    </div>
  );
}
