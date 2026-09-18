/*
# Add RPC function for Admins to change user roles

1. New Functions
- `admin_set_user_role`
  - Takes `p_user_id` (uuid) and `p_role` (text).
  - Checks if the caller is an admin by querying their own profile.
  - Updates the target user's role in the `profiles` table.
  - Marked as SECURITY DEFINER to bypass RLS.
*/

CREATE OR REPLACE FUNCTION admin_set_user_role(
  p_user_id uuid,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
BEGIN
  -- 1. Check if caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Get caller's role
  SELECT role INTO v_caller_role
  FROM profiles
  WHERE id = auth.uid() OR user_id = auth.uid();

  -- 3. Verify admin status
  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can change user roles';
  END IF;

  -- 4. Validate the requested role
  IF p_role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- 5. Update the target user's role
  UPDATE profiles
  SET role = p_role,
      user_type = CASE 
        WHEN p_role = 'admin' THEN 'student'::user_type -- admins are technically students in terms of legacy user_type
        ELSE p_role::user_type 
      END,
      updated_at = now()
  WHERE user_id = p_user_id OR id = p_user_id;

END;
$$;
