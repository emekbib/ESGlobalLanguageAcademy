'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeachers } from '@/hooks/use-teachers';
import TeacherCard, { TeacherCardData } from '@/components/teacher/teacher-card';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';



const CATEGORIES = [
  { id: 'all', label: 'All Teachers' },
  { id: 'english', label: 'English' },
  { id: 'german', label: 'German' },
  { id: 'amharic', label: 'Amharic (አማርኛ)' },
  { id: 'french', label: 'French' },
  { id: 'arabic', label: 'Arabic (العربية)' },
  { id: 'oromo', label: 'Afan Oromo' },
  { id: 'italian', label: 'Italian' },
  { id: 'mandarin', label: 'Mandarin' },
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

  // Duplicate list for infinite moving animation when viewing "all"
  const isMarquee = selectedCategory === 'all';
  const marqueeList = [...filteredTeachers, ...filteredTeachers];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      {/* Header with Title and Sleek Nav Chevrons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            Curated Faculty
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Top Teachers.{' '}
            <span className="font-normal text-stone-400">
              Access to verified native educators
            </span>
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Learn at your own pace with vetted professionals tailored to your goals.
          </p>
        </div>

        {/* Sleek Left / Right Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-all hover:border-stone-400 hover:bg-stone-50 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-all hover:border-stone-400 hover:bg-stone-50 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Category Pills (Clean tactile pills) */}
      <div className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'border border-stone-200/80 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Teacher Cards Container — Completely hidden native scrollbar with auto-glide animation */}
      <div className="relative mt-8 overflow-hidden">
        {isMarquee ? (
          /* Smooth Infinite Moving Marquee (pauses on hover) */
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
          /* Filtered Category Smooth Scroll (native scrollbar hidden) */
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
