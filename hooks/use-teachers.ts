'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile, TeacherProfile } from '@/lib/types/database';
import type { TeacherCardData } from '@/components/teacher/teacher-card';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

type RawTeacher = TeacherProfile & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'> | null;
};

export type TeacherFilters = {
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  teacherType?: 'professional' | 'community_tutor' | 'all';
  minRating?: number;
  specialties?: string[];
};

export type SortOption = 'popular' | 'rating' | 'price_low' | 'price_high';

export function useTeachers() {
  const supabase = createSupabaseBrowserClient();
  const [teachers, setTeachers] = useState<TeacherCardData[]>([]);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: teacherProfiles, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (teacherError || !teacherProfiles || teacherProfiles.length === 0) {
        setTeachers(SAMPLE_TEACHERS);
        setAllLanguages(
          Array.from(new Set(SAMPLE_TEACHERS.flatMap((t) => t.languages))).sort(),
        );
        setLoading(false);
        return;
      }

      const userIds = teacherProfiles.map((t) => t.user_id);
      const teacherIds = teacherProfiles.map((t) => t.id);

      const [profilesRes, reviewsRes, bookingsRes] = await Promise.all([
        userIds.length
          ? supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', userIds)
          : Promise.resolve({ data: [] }),
        teacherIds.length
          ? supabase.from('reviews').select('teacher_id, rating').in('teacher_id', teacherIds)
          : Promise.resolve({ data: [] }),
        teacherIds.length
          ? supabase.from('bookings').select('teacher_id').eq('status', 'completed').in('teacher_id', teacherIds)
          : Promise.resolve({ data: [] }),
      ]);

      if (!active) return;

      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p]));

      const reviewStats = new Map<string, { total: number; count: number }>();
      for (const r of reviewsRes.data ?? []) {
        const cur = reviewStats.get(r.teacher_id) ?? { total: 0, count: 0 };
        reviewStats.set(r.teacher_id, { total: cur.total + r.rating, count: cur.count + 1 });
      }

      const lessonCounts = new Map<string, number>();
      for (const b of bookingsRes.data ?? []) {
        lessonCounts.set(b.teacher_id, (lessonCounts.get(b.teacher_id) ?? 0) + 1);
      }

      const enriched: TeacherCardData[] = teacherProfiles.map((t) => {
        const profile = profileMap.get(t.user_id);
        const stats = reviewStats.get(t.id);
        return {
          id: t.id,
          name: profile?.full_name ?? 'Language teacher',
          avatarUrl: profile?.avatar_url ?? null,
          languages: t.languages_taught,
          rating: stats ? stats.total / stats.count : 0,
          lessonsTaught: lessonCounts.get(t.id) ?? 0,
          hourlyRate: Number(t.hourly_rate),
          teacherType: t.teacher_type,
          specialties: t.specialties ?? [],
        };
      });

      setTeachers(enriched);
      setAllLanguages(
        Array.from(new Set(teacherProfiles.flatMap((t) => t.languages_taught))).sort(),
      );
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [supabase]);

  return { teachers, allLanguages, loading, error };
}
