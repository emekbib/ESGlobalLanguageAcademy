/*
# Add admin moderation controls

1. New profile fields
- `profiles.suspended_at` records when an account was suspended; NULL means active.
- `profiles.suspension_reason` stores the internal reason for an account suspension.
- The existing `profiles.role` now accepts `student`, `teacher`, or `admin`.

2. New teacher application field
- `teacher_profiles.application_status` tracks `pending`, `approved`, or `rejected`.
- Existing published profiles are marked `approved`; unpublished profiles are marked `pending`.

3. New review moderation fields
- `reviews.flagged_at` records when a review was flagged for moderation.
- `reviews.flag_reason` stores the moderation reason.

4. Security
- Account role, suspension fields, teacher publication, and application status are not client-writable.
- Admin-only SECURITY DEFINER functions perform application approval/rejection and account suspension after checking the caller's profile role.
- Admins can read all teacher applications, flagged reviews, and profiles through explicit RLS policies.
*/
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at timestamptz, ADD COLUMN IF NOT EXISTS suspension_reason text;
ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS application_status text NOT NULL DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flagged_at timestamptz, ADD COLUMN IF NOT EXISTS flag_reason text;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin'));
ALTER TABLE teacher_profiles DROP CONSTRAINT IF EXISTS teacher_profiles_application_status_check;
ALTER TABLE teacher_profiles ADD CONSTRAINT teacher_profiles_application_status_check CHECK (application_status IN ('pending', 'approved', 'rejected'));
UPDATE teacher_profiles SET application_status = CASE WHEN is_published THEN 'approved' ELSE 'pending' END WHERE application_status = 'pending';
CREATE INDEX IF NOT EXISTS teacher_profiles_application_status_idx ON teacher_profiles(application_status);
CREATE INDEX IF NOT EXISTS reviews_flagged_idx ON reviews(flagged_at) WHERE flagged_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin' AND suspended_at IS NULL);
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE UPDATE (role, suspended_at, suspension_reason) ON profiles FROM authenticated;
REVOKE UPDATE (is_published, application_status) ON teacher_profiles FROM authenticated;

DROP POLICY IF EXISTS "admin_select_all_teacher_profiles" ON teacher_profiles;
CREATE POLICY "admin_select_all_teacher_profiles" ON teacher_profiles FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admin_select_all_reviews" ON reviews;
CREATE POLICY "admin_select_all_reviews" ON reviews FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.admin_set_teacher_application_status(p_teacher_profile_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_status NOT IN ('approved', 'rejected', 'pending') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE teacher_profiles SET application_status = p_status, is_published = (p_status = 'approved'), updated_at = now() WHERE id = p_teacher_profile_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_set_teacher_application_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_teacher_application_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_account_suspension(p_user_id uuid, p_suspended boolean, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_user_id = auth.uid() THEN RAISE EXCEPTION 'Cannot suspend yourself'; END IF;
  UPDATE profiles SET suspended_at = CASE WHEN p_suspended THEN now() ELSE NULL END, suspension_reason = CASE WHEN p_suspended THEN NULLIF(trim(p_reason), '') ELSE NULL END, updated_at = now() WHERE user_id = p_user_id AND role IN ('student', 'teacher');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_set_account_suspension(uuid, boolean, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_account_suspension(uuid, boolean, text) TO authenticated;
