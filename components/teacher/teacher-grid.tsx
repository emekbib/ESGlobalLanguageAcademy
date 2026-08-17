'use client';

import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import TeacherCard, { type TeacherCardData } from '@/components/teacher/teacher-card';
import type { SortOption } from '@/hooks/use-teachers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type TeacherGridProps = {
  teachers: TeacherCardData[];
  loading: boolean;
  error: boolean;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
};

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Most popular',
  rating: 'Highest rated',
  price_low: 'Price: low to high',
  price_high: 'Price: high to low',
};

const PAGE_SIZE = 9;

export default function TeacherGrid({
  teachers,
  loading,
  error,
  sort,
  onSortChange,
  onClearFilters,
}: TeacherGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    const copy = [...teachers];
    switch (sort) {
      case 'rating':
        return copy.sort((a, b) => b.rating - a.rating || b.lessonsTaught - a.lessonsTaught);
      case 'price_low':
        return copy.sort((a, b) => a.hourlyRate - b.hourlyRate);
      case 'price_high':
        return copy.sort((a, b) => b.hourlyRate - a.hourlyRate);
      case 'popular':
      default:
        return copy.sort((a, b) => b.lessonsTaught - a.lessonsTaught);
    }
  }, [teachers, sort]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[22rem] animate-pulse rounded-2xl border bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-destructive">
        We couldn&apos;t load teachers right now. Please try again later.
      </div>
    );
  }

  return (
    <div>
      {/* Result count + sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? 'teacher' : 'teachers'} found
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Sort by</label>
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border bg-card px-6 py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-5 text-xl font-bold">No teachers match your filters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try widening your search or clearing some filters.
          </p>
          <Button onClick={onClearFilters} variant="outline" className="mt-5">
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more teachers
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
