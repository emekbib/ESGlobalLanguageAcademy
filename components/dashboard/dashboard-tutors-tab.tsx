'use client';

import { useState } from 'react';
import {
  Star,
  Calendar,
  Search,
  X,
  BadgeCheck,
} from 'lucide-react';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';
import BookingCard from '@/components/teacher/booking-card';

export default function DashboardTutorsTab({
  onFindMore,
}: {
  onFindMore: () => void;
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const myTutors = SAMPLE_TEACHERS.slice(0, 2); // Sample connected tutors

  const selectedTeacher = SAMPLE_TEACHERS.find((t) => t.id === selectedTeacherId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Personal Faculty
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
            My Tutors
          </h2>
          <p className="mt-1 text-xs text-stone-500 font-medium">
            Educators you have scheduled lessons with or saved to your personal faculty list.
          </p>
        </div>
        <button
          type="button"
          onClick={onFindMore}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-stone-800"
        >
          <Search className="h-3.5 w-3.5 text-amber-300" />
          Browse Faculty
        </button>
      </div>

      {/* Tutors List: Intro.co Expert Cards */}
      <div className="space-y-4">
        {myTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <img
                src={tutor.avatarUrl || undefined}
                alt={tutor.name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-stone-200 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-stone-950">
                    {tutor.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/50">
                    <BadgeCheck className="h-3 w-3" />
                    Active Mentor
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-stone-500 font-medium">
                  {tutor.languages.join(' & ')} Instructor · ${tutor.hourlyRate} / 50 min
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{tutor.rating}</span>
                  <span className="text-stone-400">({tutor.lessonsTaught} sessions taught)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedTeacherId(tutor.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800 active:scale-95"
              >
                <Calendar className="h-3.5 w-3.5 text-amber-300" />
                Book Next Lesson
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Drawer for Selected Tutor */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedTeacherId(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4">
              <h3 className="font-display text-lg font-bold text-stone-950">
                Book with {selectedTeacher.name}
              </h3>
              <p className="text-xs text-stone-500">
                Select your preferred 1-on-1 slot and checkout securely.
              </p>
            </div>
            <BookingCard
              teacherId={selectedTeacher.id}
              hourlyRate={selectedTeacher.hourlyRate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
