'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeachers } from '@/hooks/use-teachers';
import TeacherCard, { TeacherCardData } from '@/components/teacher/teacher-card';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

const CATEGORIES = [
  { id: 'all', label: 'All Faculty' },
  { id: 'amharic', label: 'Amharic' },
  { id: 'tigrigna', label: 'Tigrigna' },
  { id: 'oromo', label: 'Afaan Oromo' },
  { id: 'somali', label: 'Somali' },
  { id: 'swahili', label: 'Swahili' },
];

export default function FeaturedTeachers() {
  const { teachers: dbTeachers } = useTeachers();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sourceTeachers = dbTeachers && dbTeachers.length > 0 ? dbTeachers : SAMPLE_TEACHERS;

  const filteredTeachers = sourceTeachers.filter((teacher) => {
    if (selectedCategory === 'all') return true;
    return teacher.languages.some((lang) =>
      lang.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const isMarquee = selectedCategory === 'all';
  const marqueeList = [...filteredTeachers, ...filteredTeachers];

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
              Verified 1-on-1 language masters
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-medium">
            Book private lessons with certified native speakers tailored to your fluency goals.
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
        {isMarquee ? (
          <div className="overflow-hidden">
            <div className="animate-marquee flex gap-6">
              {marqueeList.map((teacher, index) => (
                <div key={`${teacher.id}-${index}`} className="w-[270px] shrink-0">
                  <TeacherCard teacher={teacher} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex gap-6 overflow-x-auto pb-4 scroll-smooth"
          >
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="w-[270px] shrink-0">
                <TeacherCard teacher={teacher} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
