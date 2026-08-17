/*
# Secure public teacher directory visibility

1. Data integrity
- Add a publication check so a teacher profile cannot be marked published unless
  it has a non-empty bio, at least one language, and a positive hourly rate.
- This prevents incomplete profiles from becoming visible or bookable through
  direct database requests that bypass the form.

2. Security
- Replace the authenticated-only profile read policy with a public read policy
  because public teacher cards need the teacher's display name and avatar.
- The application selects only full_name and avatar_url from profiles for the
  public directory and teacher detail page.
- Profile writes remain restricted to the profile owner.

3. Important notes
- Unpublished teacher_profiles remain visible only to their owner.
- Public pages must always filter teacher_profiles with is_published = true.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_profiles_published_complete_check'
      AND conrelid = 'teacher_profiles'::regclass
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_published_complete_check CHECK (
        NOT is_published
        OR (
          length(trim(coalesce(bio, ''))) > 0
          AND cardinality(languages_taught) > 0
          AND hourly_rate > 0
        )
      );
  END IF;
END $$;

DROP POLICY IF EXISTS "select_all_profiles_authenticated" ON profiles;
DROP POLICY IF EXISTS "select_public_profile_info" ON profiles;

CREATE POLICY "select_public_profile_info"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);
