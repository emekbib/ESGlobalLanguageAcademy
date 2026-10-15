'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile, TeacherProfile } from '@/lib/types/database';
import type { TeacherCardData } from '@/components/teacher/teacher-card';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

type RawTeacher = TeacherProfile & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'> | null;
};

export const APPROVED_LANGUAGES = ['Amharic', 'Tigrigna', 'Afaan Oromo', 'Somali'] as const;

export function normalizeLanguageName(lang: string): string {
  if (!lang) return '';
  const l = lang.trim().toLowerCase();
  if (l.includes('amharic')) return 'Amharic';
  if (l.includes('tigrigna') || l.includes('tigrinya')) return 'Tigrigna';
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
      // 1. Fetch all teacher profiles
      const { data: rawTeacherProfiles } = await supabase
        .from('teacher_profiles')
        .select('*')
        .or('application_status.is.null,application_status.neq.rejected')
        .order('created_at', { ascending: false });

      // 2. Also fetch all users with role 'teacher' from profiles
      const { data: teacherProfilesFromUsers } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('role', 'teacher');

      if (!active) return;

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

      const enriched: TeacherCardData[] = teacherProfiles.map((t) => {
        const profile = profileMap.get(t.user_id);
        const stats = reviewStats.get(t.id);
        const rawLangs: string[] = Array.isArray(t.languages_taught) ? t.languages_taught : [];
        const normalizedLangs: string[] = Array.from(
          new Set(rawLangs.map((l) => normalizeLanguageName(l)).filter((l): l is string => Boolean(l)))
        );
        return {
          id: t.id,
          userId: t.user_id,
          name: profile?.full_name ?? 'Language Teacher',
          avatarUrl: profile?.avatar_url ?? null,
          languages: normalizedLangs.length > 0 ? normalizedLangs : ['Amharic'],
          rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 5.0,
          lessonsTaught: lessonCounts.get(t.id) ?? 0,
          hourlyRate: Number(t.hourly_rate) || 35,
          teacherType: t.teacher_type ?? 'community_tutor',
          specialties: t.specialties ?? [],
        };
      });

      // Include any user who registered as a teacher but whose profile is not yet in teacherProfiles
      const existingUserIds = new Set(teacherProfiles.map((t) => t.user_id));
      const additionalTeachers: TeacherCardData[] = (teacherProfilesFromUsers ?? [])
        .filter(
          (p) =>
            !existingUserIds.has(p.user_id) &&
            p.full_name &&
            p.full_name.trim().length > 2 &&
            p.full_name.trim().toLowerCase() !== 'not'
        )
        .map((p) => ({
          id: p.user_id,
          userId: p.user_id,
          name: p.full_name || 'Native Educator',
          avatarUrl: p.avatar_url ?? null,
          languages: ['Amharic'],
          rating: 5.0,
          lessonsTaught: 0,
          hourlyRate: 35,
          teacherType: 'community_tutor',
          specialties: ['Conversational Fluency'],
        }));

      // Clean name helper to strip demo tags and special characters
      const cleanName = (n: string) =>
        n.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z0-9]/g, '').trim();

      // Deduplicate real teachers so multiple database entries don't duplicate cards
      const uniqueRealMap = new Map<string, TeacherCardData>();
      for (const t of [...enriched, ...additionalTeachers]) {
        if (!t.name || t.name.trim().toLowerCase() === 'not') continue;
        const key = cleanName(t.name);
        const existing = uniqueRealMap.get(key);
        if (!existing) {
          uniqueRealMap.set(key, t);
        } else {
          // Prefer teacher with avatarUrl, higher lessons taught, or verified status
          if ((!existing.avatarUrl && t.avatarUrl) || t.lessonsTaught > existing.lessonsTaught) {
            uniqueRealMap.set(key, t);
          }
        }
      }
      const allRealTeachers = Array.from(uniqueRealMap.values());

      // Deduplicate sample educators matching any real educator by base name
      const existingBaseNames = new Set(allRealTeachers.map((t) => cleanName(t.name)));
      const filteredSampleTeachers = SAMPLE_TEACHERS.filter((st) => {
        return !existingBaseNames.has(cleanName(st.name));
      });

      // Show real registered teachers at the top, followed by deduplicated sample educators
      const allTeachers: TeacherCardData[] =
        allRealTeachers.length > 0
          ? [...allRealTeachers, ...filteredSampleTeachers]
          : SAMPLE_TEACHERS;

      setTeachers(allTeachers);

      // Discovered approved languages for filter sidebar
      const discoveredLangs = new Set(
        allTeachers.flatMap((t) => (t.languages ?? []).map(normalizeLanguageName).filter(Boolean))
      );
      const activeApproved = APPROVED_LANGUAGES.filter((lang) => discoveredLangs.has(lang));
      setAllLanguages(activeApproved.length > 0 ? activeApproved : [...APPROVED_LANGUAGES]);
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [supabase]);

  return { teachers, allLanguages, loading, error };
}
