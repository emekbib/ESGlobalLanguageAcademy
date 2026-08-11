/*
# Create profiles table for two-sided marketplace

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — one row per user account
  - `user_type` (enum: 'student' | 'teacher') — which side of the marketplace this user operates on
  - `full_name` (text) — display name
  - `avatar_url` (text, nullable) — profile photo URL
  - `bio` (text, nullable) — short description (e.g. teacher expertise or student goals)
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())

2. New Types
- `user_type` enum with values 'student' and 'teacher'

3. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only read, insert, update, and delete their OWN profile row.
- `id` defaults to `auth.uid()` so an insert that omits the id still satisfies the WITH CHECK.
- No anon access — this is an authenticated marketplace (sign-in required).

4. Important Notes
- This is the foundation table for a two-sided marketplace. Student- and teacher-specific
  tables (listings, bookings, messages, etc.) will be added in later migrations and will
  reference `profiles.id` as the owner.
- The `user_type` enum is the mechanism that routes users to the correct side of the
  marketplace (student dashboard vs teacher dashboard).
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('student', 'teacher');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT: users can create their own profile (id defaults to auth.uid())
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: users can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: users can delete their own profile
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);