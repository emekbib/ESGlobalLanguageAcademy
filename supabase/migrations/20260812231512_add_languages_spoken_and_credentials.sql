/*
# Add languages_spoken and credentials to teacher_profiles

1. Changes to existing tables
- `teacher_profiles.languages_spoken` — new text[] column, defaults to '{}'.
  Stores additional languages the teacher speaks (beyond what they teach),
  shown as "Also speaks: French, German" on the profile page.
- `teacher_profiles.credentials` — new text[] column, defaults to '{}'.
  Stores certifications/qualifications like "TEFL Certified", "5 years experience".

2. Data backfill
- Existing seeded teacher rows get varied languages_spoken and credentials.

3. Security
- No RLS policy changes. The existing public read policy on teacher_profiles
  already covers these columns.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS languages_spoken text[] NOT NULL DEFAULT '{}';

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS credentials text[] NOT NULL DEFAULT '{}';

UPDATE teacher_profiles
SET
  languages_spoken = CASE
    WHEN user_id = 'a0000000-0000-0000-0000-000000000001' THEN ARRAY['English', 'Portuguese']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000002' THEN ARRAY['English']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN ARRAY['English', 'German']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000004' THEN ARRAY['English', 'Spanish']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000005' THEN ARRAY['English']::text[]
    ELSE ARRAY[]::text[]
  END,
  credentials = CASE
    WHEN user_id = 'a0000000-0000-0000-0000-000000000001' THEN ARRAY['DELE Examiner Certified', '8 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000002' THEN ARRAY['JLPT N1 Certified', '6 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN ARRAY['DALF C1 Certified', '4 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000004' THEN ARRAY['TEFL Certified', '10 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000005' THEN ARRAY['HSK 6 Certified', '7 years teaching experience']::text[]
    ELSE ARRAY[]::text[]
  END
WHERE languages_spoken = '{}';
