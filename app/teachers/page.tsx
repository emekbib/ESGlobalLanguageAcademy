'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, SlidersHorizontal, ArrowLeft } from 'lucide-react';
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
import { X } from 'lucide-react';

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
    <main className="min-h-screen bg-slate-50/70">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </span>
            ESGlobalLanguageAcademy
          </Link>
          <Link
            href="/auth"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Become a teacher
          </Link>
        </div>
      </header>

      {/* Page heading */}
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-12">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Find your teacher
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Browse our community of language teachers and find a learning style that feels right for you.
        </p>
      </section>

      {/* Mobile filter button */}
      <div className="mx-auto max-w-7xl px-6 lg:hidden">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="mb-4 w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerClose asChild>
                <button className="rounded-full p-1 hover:bg-muted">
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
            <div className="sticky top-24 rounded-2xl border bg-card p-6">
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
