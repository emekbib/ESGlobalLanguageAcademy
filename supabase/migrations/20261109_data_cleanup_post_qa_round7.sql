-- ============================================================
-- ES Global Language Academy — Data Cleanup Migration
-- Generated: 2026-11-09 (Post Round-7 E2E test)
--
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Fix admin account display name
--    User 3d9d7c11 is Estephanos Mekbib (admin) but stored as "Bethelhem Mengistu (Teacher Demo)"
UPDATE public.profiles
SET full_name = 'Estephanos Mekbib'
WHERE user_id = '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f'
  AND full_name LIKE '%Teacher Demo%';

-- 2. Unpublish stale teacher_profiles for the admin account (3d9d7c11)
--    Admin should not appear in the public teacher directory
UPDATE public.teacher_profiles
SET is_published = false
WHERE id = 'dde171b6-f80d-40da-9fb2-4f40989f7594'   -- admin user teacher profile
  AND user_id = '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f';

-- 3. Unpublish stale teacher_profile for the "Teacher Demo" Bethelhem account (929d1fe7)
--    This is a demo account; the canonical Bethelhem teacher is 3f2df090
UPDATE public.teacher_profiles
SET is_published = false
WHERE id = 'c8ab3997-e80e-4695-b287-f6188a5595c2'   -- demo teacher profile
  AND user_id = '929d1fe7-861b-4557-977e-00033946e52a';

-- 4. Keep only the canonical Bethelhem teacher profile published
--    adff8204 → user 3f2df090 → "Bethelhem Mengistu" (clean, no "Teacher Demo" suffix)
-- (No change needed — this one is already published and correct)

-- ============================================================
-- Verification queries — run after migration to confirm:
-- ============================================================

-- Check admin name:
SELECT user_id, full_name, role FROM public.profiles
WHERE user_id = '3d9d7c11-1d5b-4af3-bd5c-5bd12bc1106f';
-- Expected: full_name = 'Estephanos Mekbib', role = 'admin'

-- Check published teacher_profiles:
SELECT tp.id, p.full_name, tp.is_published
FROM public.teacher_profiles tp
JOIN public.profiles p ON p.user_id = tp.user_id
WHERE p.full_name ILIKE '%Bethelhem%'
ORDER BY tp.is_published DESC;
-- Expected: only adff8204 (Bethelhem Mengistu) is published = true

-- Check no admin has is_published teacher_profile:
SELECT tp.id, p.full_name, p.role, tp.is_published
FROM public.teacher_profiles tp
JOIN public.profiles p ON p.user_id = tp.user_id
WHERE p.role = 'admin' AND tp.is_published = true;
-- Expected: 0 rows

