/*
# Add profile role and user identity columns

1. New columns on `profiles`
- `user_id` (uuid, required, references auth.users) — the account owner.
- `role` (text, required, student or teacher) — the user's marketplace role.
- `updated_at` already exists and continues to track profile edits.

2. Compatibility
- Existing profile columns are preserved to avoid data loss. The existing
  `user_type` column remains available for older records while new application
  code uses `role`.
- New profile rows default both identity columns to the signed-in account.

3. Security
- Authenticated users can read profile rows so the marketplace can discover
  other users' basic names and avatars.
- Only the profile owner can insert, update, or delete their own row.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher'));
  END IF;
END $$;

UPDATE profiles
SET user_id = id
WHERE user_id IS NULL;

UPDATE profiles
SET role = CASE WHEN user_type::text = 'teacher' THEN 'teacher' ELSE 'student' END
WHERE role IS NULL;

ALTER TABLE profiles
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles(user_id);

DROP POLICY IF EXISTS "select_all_profiles_authenticated" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;

CREATE POLICY "select_all_profiles_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
