'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile, TeacherProfile } from '@/lib/types/database';
import type { TeacherCardData } from '@/components/teacher/teacher-card';
import { isDemoOrQaName, stripDemoSuffix } from '@/lib/teacher/profile';

export const APPROVED_LANGUAGES = ['Amharic', 'Tigrinya', 'Afaan Oromo', 'Somali'] as const;

export function normalizeLanguageName(lang: string): string {
  if (!lang) return '';
  const l = lang.trim().toLowerCase();
  if (l.includes('amharic')) return 'Amharic';
  if (l.includes('tigrigna') || l.includes('tigrinya')) return 'Tigrinya';
  if (l.includes('oromo') || l.includes('afaan')) return 'Afaan Oromo';
  if (l.includes('somali')) return 'Somali';
  return lang.trim();
}

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
      // Published teachers with application_status NULL or 'approved' (not 'rejected' or 'pending').
      const { data: rawTeacherProfiles, error: fetchError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('is_published', true)
        .or('application_status.is.null,application_status.eq.approved')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(true);
        setLoading(false);
        return;
      }

      const teacherProfiles = rawTeacherProfiles ?? [];
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

      const enriched: TeacherCardData[] = [];
      const seenIds = new Set<string>();

      for (const t of teacherProfiles) {
        // Deduplicate by teacher_profile id — never by name.
        if (seenIds.has(t.id)) continue;
        seenIds.add(t.id);

        const profile = profileMap.get(t.user_id);
        const rawName = profile?.full_name ?? null;

        // Exclude demo/QA accounts by explicit name markers only.
        // An empty name does NOT mean demo — the teacher just hasn't set it yet.
        if (isDemoOrQaName(rawName)) continue;

        const displayName = stripDemoSuffix(rawName) || 'Language Educator';

        const stats = reviewStats.get(t.id);
        const rawLangs: string[] = Array.isArray(t.languages_taught) ? t.languages_taught : [];
        const normalizedLangs: string[] = Array.from(
          new Set(rawLangs.map((l) => normalizeLanguageName(l)).filter((l): l is string => Boolean(l)))
        );

        // No invented defaults — show real values or honest empty states.
        enriched.push({
          id: t.id,
          userId: t.user_id,
          name: displayName,
          avatarUrl: profile?.avatar_url ?? null,
          languages: normalizedLangs,
          rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
          lessonsTaught: lessonCounts.get(t.id) ?? 0,
          hourlyRate: Number(t.hourly_rate) || 0,
          teacherType: t.teacher_type ?? 'community_tutor',
          specialties: t.specialties ?? [],
        });
      }

      setTeachers(enriched);

      // Discovered approved languages for filter sidebar
      const discoveredLangs = new Set(
        enriched.flatMap((t) => (t.languages ?? []).map(normalizeLanguageName).filter(Boolean))
      );
      setAllLanguages([...APPROVED_LANGUAGES]);
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [supabase]);

  return { teachers, allLanguages, loading, error };
}
