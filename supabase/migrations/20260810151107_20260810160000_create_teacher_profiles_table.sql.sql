/*
# Create teacher_profiles table

1. New Tables
- `teacher_profiles`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `user_id` (uuid, required, references auth.users ON DELETE CASCADE, unique) — one row per teacher
  - `bio` (text, nullable) — teacher's biography / description
  - `languages_taught` (text[], required, default '{}') — array of languages the teacher offers
  - `hourly_rate` (numeric(10,2), required) — price per hour in USD
  - `years_experience` (integer, required, default 0) — years of teaching experience
  - `video_intro_url` (text, nullable) — optional URL to a video introduction
  - `is_published` (boolean, required, default false) — whether the profile is visible in the public directory
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Constraints
- `teacher_profiles_hourly_rate_check` — hourly_rate must be >= 0
- `teacher_profiles_years_experience_check` — years_experience must be >= 0
- Unique index on `user_id` ensures one teacher profile per account

3. Indexes
- `teacher_profiles_user_id_key` — unique index on user_id for fast owner lookups
- `teacher_profiles_published_idx` — partial index on (is_published) WHERE is_published = true, speeds up the public directory query

4. Security
- Enable RLS on `teacher_profiles`.
- SELECT: anyone (anon + authenticated) can read published profiles so the public
  directory works without sign-in. Authenticated users can additionally read their
  own unpublished profile so they can preview/edit before publishing.
- INSERT: authenticated users can insert only their own row (auth.uid() = user_id).
- UPDATE: authenticated users can update only their own row.
- DELETE: authenticated users can delete only their own row.
- The `is_published` flag is the gate: unpublished profiles never appear in the
  public directory or detail page because those queries filter on is_published = true.

5. Important Notes
- A teacher must fill in bio, languages_taught (non-empty), hourly_rate, and
  years_experience before setting is_published = true. This is enforced in the
  application layer (the onboarding form validates all fields before publishing).
- The public /teachers directory and /teachers/[id] pages query with
  .eq('is_published', true) so unpublished or incomplete profiles are never
  listed or bookable.
- user_id defaults to auth.uid() so an insert that omits user_id still satisfies
  the WITH CHECK ownership predicate.
*/

CREATE TABLE IF NOT EXISTS teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  languages_taught text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  years_experience integer NOT NULL DEFAULT 0,
  video_intro_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_profiles_hourly_rate_check'
      AND conrelid = 'teacher_profiles'::regclass
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_hourly_rate_check CHECK (hourly_rate >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_profiles_years_experience_check'
      AND conrelid = 'teacher_profiles'::regclass
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_years_experience_check CHECK (years_experience >= 0);
  END IF;
END $$;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS teacher_profiles_user_id_key ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS teacher_profiles_published_idx ON teacher_profiles(is_published) WHERE is_published = true;

-- Policies (drop first for idempotency, then create)
DROP POLICY IF EXISTS "select_published_teacher_profiles" ON teacher_profiles;
CREATE POLICY "select_published_teacher_profiles"
  ON teacher_profiles FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "insert_own_teacher_profile"
  ON teacher_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "update_own_teacher_profile"
  ON teacher_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "delete_own_teacher_profile"
  ON teacher_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
