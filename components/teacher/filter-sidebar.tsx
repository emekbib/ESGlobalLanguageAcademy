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
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Clear all
        </button>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Language</label>
        <select
          value={filters.language ?? ''}
          onChange={(e) => update({ language: e.target.value || undefined })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
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
          <label className="text-sm font-semibold">Price range</label>
          <span className="text-sm text-muted-foreground">
            ${filters.minPrice ?? 5}–${filters.maxPrice ?? 50}/hr
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
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Teacher type</label>
        <div className="flex flex-col gap-2">
          {(['professional', 'community_tutor'] as const).map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.teacherType === type}
                onCheckedChange={() => toggleTeacherType(type)}
              />
              <span className="capitalize">
                {type === 'professional' ? 'Professional Teacher' : 'Community Tutor'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Minimum rating</label>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.minRating === rating}
                onCheckedChange={() =>
                  update({ minRating: filters.minRating === rating ? undefined : rating })
                }
              />
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {rating}+
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map((specialty) => {
            const selected = (filters.specialties ?? []).includes(specialty);
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => toggleSpecialty(specialty)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/50'
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
