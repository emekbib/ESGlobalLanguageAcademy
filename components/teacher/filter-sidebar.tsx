'use client';

import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, X } from 'lucide-react';
import type { TeacherFilters } from '@/hooks/use-teachers';

export const SPECIALTY_OPTIONS = ['Kids', 'Business', 'Exam Prep', 'Conversation'] as const;
export const RATING_OPTIONS = [4.5, 4.0, 3.5] as const;

type FilterSidebarProps = {
  filters: TeacherFilters;
  languages: string[];
  onFilterChange: (filters: TeacherFilters) => void;
  onClear: () => void;
};

export default function FilterSidebar({
  filters,
  languages,
  onFilterChange,
  onClear,
}: FilterSidebarProps) {
  const update = (patch: Partial<TeacherFilters>) => onFilterChange({ ...filters, ...patch });

  const toggleSpecialty = (specialty: string) => {
    const current = filters.specialties ?? [];
    const next = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    update({ specialties: next });
  };

  const toggleTeacherType = (type: 'professional' | 'community_tutor') => {
    const current = filters.teacherType;
    if (current === type) {
      update({ teacherType: 'all' });
    } else if (current === 'all') {
      update({ teacherType: type });
    } else {
      update({ teacherType: type });
    }
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800 pb-4">
        <h2 className="font-display text-base font-bold tracking-tight text-stone-900 dark:text-white">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 transition-colors hover:text-stone-900 dark:hover:text-stone-200"
        >
          Clear all
        </button>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Language</label>
        <select
          value={filters.language ?? ''}
          onChange={(e) => update({ language: e.target.value || undefined })}
          className="h-11 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-3.5 text-sm font-medium text-stone-800 dark:text-stone-200 shadow-sm transition focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600"
        >
          <option value="">All languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Price range</label>
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
            ${filters.minPrice ?? 5}–${filters.maxPrice ?? 50} / hr
          </span>
        </div>
        <Slider
          defaultValue={[filters.minPrice ?? 5, filters.maxPrice ?? 50]}
          min={5}
          max={50}
          step={1}
          onValueChange={(value) => update({ minPrice: value[0], maxPrice: value[1] })}
          className="py-2"
        />
      </div>

      {/* Teacher type */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Teacher type</label>
        <div className="flex flex-col gap-2">
          {(['professional', 'community_tutor'] as const).map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
              <Checkbox
                checked={filters.teacherType === type}
                onCheckedChange={() => toggleTeacherType(type)}
              />
              <span className="capitalize font-medium">
                {type === 'professional' ? 'Professional Teacher' : 'Community Tutor'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Minimum rating</label>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
              <Checkbox
                checked={filters.minRating === rating}
                onCheckedChange={() =>
                  update({ minRating: filters.minRating === rating ? undefined : rating })
                }
              />
              <span className="flex items-center gap-1 font-medium">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {rating}+ & above
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Specialties</label>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALTY_OPTIONS.map((specialty) => {
            const selected = (filters.specialties ?? []).includes(specialty);
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => toggleSpecialty(specialty)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected
                    ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                {selected && <X className="mr-1 inline h-3 w-3" />}
                {specialty}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
