'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeachers } from '@/hooks/use-teachers';
import TeacherCard, { TeacherCardData } from '@/components/teacher/teacher-card';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

const CATEGORIES = [
  { id: 'all', label: 'All Faculty' },
  { id: 'amharic', label: 'Amharic' },
  { id: 'tigrinya', label: 'Tigrinya' },
  { id: 'oromo', label: 'Afaan Oromo' },
  { id: 'somali', label: 'Somali' },
];

export default function FeaturedTeachers() {
  const { teachers: dbTeachers, loading, error } = useTeachers();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Render the final list once. Previously sample teachers were shown while loading and
  // then swapped for the real list, so the carousel visibly changed (e.g. 8 → 9 cards).
  const sourceTeachers = loading
    ? []
    : dbTeachers && dbTeachers.length > 0
    ? dbTeachers.slice(0, 8)
    : error
    ? SAMPLE_TEACHERS.slice(0, 8)
    : [];

  const filteredTeachers = sourceTeachers.filter((teacher) => {
    if (selectedCategory === 'all') return true;
    return teacher.languages.some((lang) => {
      const l = lang.toLowerCase();
      const target = selectedCategory.toLowerCase();
      if (target === 'tigrinya' || target === 'tigrigna') {
        return l.includes('tigr');
      }
      return l.includes(target);
    });
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      {/* Header with Title and Sleek Nav Chevrons (Intro.co style) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Curated Native Faculty
          </span>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            Top Educators.{' '}
            <span className="font-normal text-stone-400">
              Native 1-on-1 language masters
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-medium">
            Book private lessons with native speakers tailored to your fluency goals.
          </p>
        </div>

        {/* Sleek Left / Right Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Pills (Intro.co style) */}
      <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                active
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'border border-stone-200/80 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Teacher Cards Container */}
      <div className="relative mt-8 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex gap-6 overflow-x-auto pb-4 scroll-smooth"
        >
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-[380px] w-[270px] shrink-0 animate-pulse rounded-3xl bg-stone-100" />
            ))}
          {filteredTeachers.map((teacher, index) => (
            <div key={`${teacher.id}-${index}`} className="w-[270px] shrink-0">
              <TeacherCard teacher={teacher} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
