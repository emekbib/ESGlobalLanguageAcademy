/*
# Add teacher_type and specialties to teacher_profiles

1. Changes to existing tables
- `teacher_profiles.teacher_type` — new text column, defaults to 'professional'.
  Values: 'professional' or 'community_tutor'. Lets the directory filter between
  vetted professional teachers and community tutors.
- `teacher_profiles.specialties` — new text[] column, defaults to '{}'.
  Stores tags like 'Kids', 'Business', 'Exam Prep', 'Conversation' so students
  can filter by teaching focus.

2. Data backfill
- Existing rows get 'professional' as their teacher_type and '{}' specialties.

3. Security
- No RLS policy changes. The existing public read policy on teacher_profiles
  already covers these columns.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS teacher_type text NOT NULL DEFAULT 'professional';

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}';

-- Backfill existing rows with varied teacher types and specialties
UPDATE teacher_profiles
SET teacher_type = CASE
  WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN 'community_tutor'
  ELSE 'professional'
END,
specialties = CASE
  WHEN user_id = 'a0000000-0000-0000-0000-000000000001' THEN ARRAY['Conversation', 'Exam Prep']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000002' THEN ARRAY['Business', 'Exam Prep']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN ARRAY['Conversation', 'Kids']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000004' THEN ARRAY['Business', 'Conversation']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000005' THEN ARRAY['Kids', 'Exam Prep']::text[]
  ELSE ARRAY[]::text[]
END
WHERE specialties = '{}';
