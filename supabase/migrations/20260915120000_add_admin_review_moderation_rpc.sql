/*
# Add Admin Review Moderation RPC & Policies

1. New RPC Function
- `admin_moderate_review(p_review_id uuid, p_action text)`:
  - Validates caller via `public.is_admin()`
  - For `dismiss`: sets `flagged_at = NULL, flag_reason = NULL`
  - For `delete`: permanently deletes the review
  - Runs with `SECURITY DEFINER` so administrators can moderate reviews despite student-author RLS

2. Admin RLS Policies for Reviews
- `admin_update_all_reviews`: allows authenticated admins to update review rows
- `admin_delete_all_reviews`: allows authenticated admins to delete review rows
*/

-- RLS Policies on reviews for Admins
DROP POLICY IF EXISTS "admin_update_all_reviews" ON reviews;
CREATE POLICY "admin_update_all_reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_all_reviews" ON reviews;
CREATE POLICY "admin_delete_all_reviews" ON reviews
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Atomic Admin Moderation RPC
CREATE OR REPLACE FUNCTION public.admin_moderate_review(p_review_id uuid, p_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized. Administrator privileges required.';
  END IF;

  IF p_action = 'dismiss' THEN
    UPDATE reviews
    SET flagged_at = NULL,
        flag_reason = NULL
    WHERE id = p_review_id;
  ELSIF p_action = 'delete' THEN
    DELETE FROM reviews
    WHERE id = p_review_id;
  ELSE
    RAISE EXCEPTION 'Invalid moderation action: %', p_action;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_moderate_review(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_review(uuid, text) TO authenticated;
