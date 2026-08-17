/*
# Keep profile role fields in sync

1. Purpose
- Make profile creation work across the current and previously deployed onboarding screens.

2. Modified table
- `profiles`
  - When `user_type` is missing or explicitly null, derive it from `role`.
  - Falls back to `student` only when no role is provided.
  - Keeps the existing NOT NULL constraint and role validation intact.

3. Security
- Adds a database trigger only for normalizing the two profile role fields.
- The trigger does not grant access or change row-level security policies.

4. Important notes
- Existing profile rows are unchanged.
- Teacher selections remain `teacher`; student selections remain `student`.
*/

CREATE OR REPLACE FUNCTION public.sync_profile_user_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type IS NULL THEN
    NEW.user_type := COALESCE(NEW.role, 'student')::user_type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_user_type_before_write ON profiles;

CREATE TRIGGER sync_profile_user_type_before_write
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_user_type();