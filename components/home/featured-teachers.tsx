'use client';

import Link from 'next/link';
import { ArrowRight, ChevronRight, BookOpen } from 'lucide-react';
import { useTeachers } from '@/hooks/use-teachers';
import TeacherCard from '@/components/teacher/teacher-card';

export default function FeaturedTeachers() {
  const { teachers, loading } = useTeachers();
  const featured = teachers.slice(0, 8);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Meet our teachers
        </h2>
        <p className="mt-3 text-muted-foreground">
          Real teachers, real reviews, ready to help you learn.
        </p>
      </div>

      {loading ? (
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[78vw] shrink-0 sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)] xl:w-[calc(25%-0.9375rem)]"
            >
              <div className="h-[22rem] animate-pulse rounded-2xl border bg-muted/40" />
            </div>
          ))}
        </div>
      ) : featured.length === 0 ? (
        <div className="rounded-2xl border bg-card px-6 py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-muted-foreground">Featured teachers are coming soon.</p>
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((teacher) => (
            <div
              key={teacher.id}
              className="w-[78vw] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)] xl:w-[calc(25%-0.9375rem)]"
            >
              <TeacherCard teacher={teacher} />
            </div>
          ))}

          {/* View all teachers card */}
          <Link
            href="/teachers"
            className="group flex w-[78vw] shrink-0 snap-start items-center justify-center sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)] xl:w-[calc(25%-0.9375rem)]"
          >
            <article className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                <ChevronRight className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-lg font-semibold">View all teachers</p>
              <p className="text-sm text-muted-foreground">Browse the full directory</p>
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
            </article>
          </Link>
        </div>
      )}
    </section>
  );
}
