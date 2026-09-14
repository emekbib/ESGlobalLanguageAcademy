'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowLeft, X } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useTeachers, type TeacherFilters, type SortOption } from '@/hooks/use-teachers';
import FilterSidebar from '@/components/teacher/filter-sidebar';
import TeacherGrid from '@/components/teacher/teacher-grid';
import type { TeacherCardData } from '@/components/teacher/teacher-card';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';

const DEFAULT_FILTERS: TeacherFilters = {
  language: undefined,
  minPrice: 5,
  maxPrice: 50,
  teacherType: 'all',
  minRating: undefined,
  specialties: [],
};

const DEFAULT_SORT: SortOption = 'popular';

function TeachersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { teachers, allLanguages, loading, error } = useTeachers();

  const [filters, setFilters] = useState<TeacherFilters>(() => ({
    ...DEFAULT_FILTERS,
    language: searchParams.get('lang') ?? searchParams.get('language') ?? undefined,
  }));
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync language filter when URL changes (e.g. clicking a language chip)
  useEffect(() => {
    const lang = searchParams.get('lang') ?? searchParams.get('language') ?? undefined;
    setFilters((prev) => ({ ...prev, language: lang }));
  }, [searchParams]);

  // Push filter changes to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.language) {
      params.set('lang', filters.language);
    } else {
      params.delete('lang');
    }
    const newUrl = `/teachers${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [filters.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, language: undefined });
    setSort(DEFAULT_SORT);
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (filters.language && !t.languages.includes(filters.language)) return false;
      if (filters.minPrice !== undefined && t.hourlyRate < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && t.hourlyRate > filters.maxPrice) return false;
      if (filters.teacherType && filters.teacherType !== 'all' && t.teacherType !== filters.teacherType)
        return false;
      if (filters.minRating !== undefined && t.rating < filters.minRating) return false;
      if (filters.specialties && filters.specialties.length > 0) {
        const teacherSpecialties = t.specialties ?? [];
        if (!filters.specialties.every((s) => teacherSpecialties.includes(s))) return false;
      }
      return true;
    });
  }, [teachers, filters]);

  return (
    <main className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <Navbar />

      {/* Page heading */}
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-24 sm:pt-28">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl">
          Find your teacher.{' '}
          <span className="font-normal text-stone-400 dark:text-stone-500">
            Learn 1-on-1 with native experts
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Browse verified educators across Amharic, Tigrigna, Afaan Oromo, Somali, and Swahili, tailored to your schedule and learning goals.
        </p>
      </section>

      {/* Mobile filter button */}
      <div className="mx-auto max-w-7xl px-6 lg:hidden">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="mb-4 w-full rounded-full border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] dark:bg-stone-900 dark:border-stone-800 text-stone-900 dark:text-stone-100">
            <DrawerHeader className="flex flex-row items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-4">
              <DrawerTitle className="font-display dark:text-white">Filters</DrawerTitle>
              <DrawerClose asChild>
                <button className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-stone-800 dark:text-stone-300">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6">
              <FilterSidebar
                filters={filters}
                languages={allLanguages}
                onFilterChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Two-column layout */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
              <FilterSidebar
                filters={filters}
                languages={allLanguages}
                onFilterChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Grid */}
          <div className="min-w-0 flex-1">
            <TeacherGrid
              teachers={filteredTeachers}
              loading={loading}
              error={error}
              sort={sort}
              onSortChange={setSort}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50/70 text-muted-foreground">Loading…</div>}>
      <TeachersPageContent />
    </Suspense>
  );
}
