-- Round 10: Canonical profile repair for teachers with multiple teacher_profiles rows.
--
-- This migration is DATA-ONLY and idempotent. It does NOT delete any rows.
-- It performs three repairs:
--
-- 1. STRIP " (Teacher Demo)" suffix from display names in profiles.full_name.
-- 2. COPY bio from non-canonical (demo/unpublished) rows to the canonical
--    (published, approved/null) row ONLY if the canonical row's bio is empty
--    or contains placeholder text.
-- 3. MOVE teacher_availability rows from non-published/demo rows to the
--    canonical row, but ONLY where the canonical row has no conflicting window
--    on the same weekday (no overlapping time ranges).
--
-- "Canonical" = the teacher_profiles row with is_published=true AND
-- (application_status IS NULL OR application_status = 'approved'), preferring
-- the most recently created row if multiple match.

-- Step 1: Strip " (Teacher Demo)" suffix from stored display names.
UPDATE profiles
SET full_name = btrim(regexp_replace(full_name, '\s*\(Teacher Demo\)\s*', '', 'gi'))
WHERE full_name ILIKE '%(Teacher Demo)%';

-- Step 2 + 3: For each user with multiple teacher_profiles rows, identify
-- canonical and non-canonical rows, then copy bio and move availability.
DO $$
DECLARE
  usr RECORD;
  canonical_id UUID;
  tp_row RECORD;
  canonical_bio TEXT;
BEGIN
  FOR usr IN
    SELECT DISTINCT user_id FROM teacher_profiles
    WHERE user_id IS NOT NULL
  LOOP
    -- Find the canonical row: published AND (approved or null status), newest first.
    SELECT id INTO canonical_id
    FROM teacher_profiles
    WHERE user_id = usr.user_id
      AND is_published = true
      AND (application_status IS NULL OR application_status = 'approved')
    ORDER BY created_at DESC
    LIMIT 1;

    -- If no published/approved row, fall back to any published row, newest first.
    IF canonical_id IS NULL THEN
      SELECT id INTO canonical_id
      FROM teacher_profiles
      WHERE user_id = usr.user_id
        AND is_published = true
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;

    -- If still no canonical, skip this user (all rows unpublished — don't guess).
    IF canonical_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Get the canonical bio.
    SELECT bio INTO canonical_bio
    FROM teacher_profiles
    WHERE id = canonical_id;

    -- Step 2: Copy bio from non-canonical rows to canonical, only if canonical bio
    -- is empty/placeholder.
    IF canonical_bio IS NULL
       OR btrim(canonical_bio) = ''
       OR canonical_bio ILIKE '%introduce yourself%'
    THEN
      FOR tp_row IN
        SELECT bio FROM teacher_profiles
        WHERE user_id = usr.user_id
          AND id <> canonical_id
          AND bio IS NOT NULL
          AND btrim(bio) <> ''
          AND bio NOT ILIKE '%introduce yourself%'
        ORDER BY created_at DESC
      LOOP
        UPDATE teacher_profiles
        SET bio = tp_row.bio
        WHERE id = canonical_id;
        EXIT; -- Only copy the first non-empty bio found.
      END LOOP;
    END IF;

    -- Step 3: Move teacher_availability rows from non-canonical rows to the
    -- canonical row, but only where no conflict exists on the same weekday.
    FOR tp_row IN
      SELECT id FROM teacher_profiles
      WHERE user_id = usr.user_id
        AND id <> canonical_id
    LOOP
      -- Move availability windows that don't conflict with existing canonical windows.
      UPDATE teacher_availability
      SET teacher_id = canonical_id
      WHERE teacher_id = tp_row.id
        AND NOT EXISTS (
          SELECT 1
          FROM teacher_availability existing
          WHERE existing.teacher_id = canonical_id
            AND existing.weekday = teacher_availability.weekday
            AND (
              (teacher_availability.start_time >= existing.start_time
               AND teacher_availability.start_time < existing.end_time)
              OR
              (teacher_availability.end_time > existing.start_time
               AND teacher_availability.end_time <= existing.end_time)
              OR
              (teacher_availability.start_time <= existing.start_time
               AND teacher_availability.end_time >= existing.end_time)
            )
        );
    END LOOP;
  END LOOP;
END $$;
