-- ==============================================================================
-- ES Global Language Academy — Database Permissions & QA Profile Name Fix
-- Generated: 2026-11-11
--
-- Instructions: Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Grant table access to authenticated users so bookings and availability can be managed
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.teacher_availability TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.teacher_profiles TO authenticated;

-- 2. Ensure RLS is enabled on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Re-establish clean RLS policies on bookings
DROP POLICY IF EXISTS "insert_own_booking" ON public.bookings;
CREATE POLICY "insert_own_booking"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "select_own_bookings" ON public.bookings;
CREATE POLICY "select_own_bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.teacher_profiles tp
      WHERE tp.id = bookings.teacher_id AND tp.user_id = auth.uid()
    )
    OR bookings.teacher_id = auth.uid()
  );

DROP POLICY IF EXISTS "update_own_booking" ON public.bookings;
CREATE POLICY "update_own_booking"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.teacher_profiles tp
      WHERE tp.id = bookings.teacher_id AND tp.user_id = auth.uid()
    )
    OR bookings.teacher_id = auth.uid()
  );

-- 4. Fix QA Teacher profile name so it displays "QA Teacher" instead of "QA Student"
UPDATE public.profiles
SET full_name = 'QA Teacher'
WHERE user_id = '5ad9014e-1d98-4780-a1e5-c365314fbdf2';

-- 5. Verification queries
SELECT user_id, full_name, role FROM public.profiles WHERE user_id = '5ad9014e-1d98-4780-a1e5-c365314fbdf2';

