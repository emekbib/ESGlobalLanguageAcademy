/*
# Allow authenticated users to read basic profile info of others

1. Security changes
- Replace the existing owner-only SELECT policy on `profiles` with one that
  allows any authenticated user to SELECT all rows (so students and teachers
  can see each other's name + avatar). Full row data (bio, user_type, etc.)
  is still returned at the database layer; the frontend will only display
  the public fields (full_name, avatar_url) for other users. The RLS layer
  permits SELECT for all authenticated users because the marketplace needs
  users to see basic info about each other.
- INSERT / UPDATE / DELETE policies remain owner-scoped (unchanged).

2. Important Notes
- This is intentionally a read-all policy scoped to `authenticated` so that
  the two-sided marketplace can display teacher/student names and avatars.
  Sensitive write operations remain restricted to the row owner.
*/

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "select_all_profiles_authenticated" ON profiles;

CREATE POLICY "select_all_profiles_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
