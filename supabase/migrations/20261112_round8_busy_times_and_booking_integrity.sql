-- QA Round 8: booking integrity
--
-- 1. get_teacher_busy_times(teacher_id)
--    Students cannot read other students' bookings (RLS), so a slot already taken by
--    someone else looked open until checkout rejected it. This exposes ONLY the start/end
--    times of a teacher's active bookings (no student ids, no amounts).
--
-- 2. Lock booking financial/identity columns after creation.
--    Signed-in users (students/teachers) may still change status (cancel, confirm after
--    verified payment) and payment references, but can never alter the price, payout,
--    teacher, student, or lesson time of an existing booking. Service-role code
--    (Stripe webhook, admin tools) is unaffected.

CREATE OR REPLACE FUNCTION public.get_teacher_busy_times(p_teacher_id uuid)
RETURNS TABLE (start_time_utc timestamptz, end_time_utc timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.start_time_utc, b.end_time_utc
  FROM public.bookings b
  WHERE b.teacher_id = p_teacher_id
    AND b.end_time_utc > now()
    AND (
      b.status = 'confirmed'
      OR (b.status = 'pending' AND b.hold_expires_at IS NOT NULL AND b.hold_expires_at > now())
    );
$$;

REVOKE ALL ON FUNCTION public.get_teacher_busy_times(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_teacher_busy_times(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bookings_lock_immutable_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    IF NEW.amount_cents IS DISTINCT FROM OLD.amount_cents
       OR NEW.platform_fee_cents IS DISTINCT FROM OLD.platform_fee_cents
       OR NEW.teacher_payout_cents IS DISTINCT FROM OLD.teacher_payout_cents
       OR NEW.student_id IS DISTINCT FROM OLD.student_id
       OR NEW.teacher_id IS DISTINCT FROM OLD.teacher_id
       OR NEW.start_time_utc IS DISTINCT FROM OLD.start_time_utc
       OR NEW.end_time_utc IS DISTINCT FROM OLD.end_time_utc THEN
      RAISE EXCEPTION 'Booking price, participants, and time cannot be changed after booking.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_lock_immutable_columns ON public.bookings;
CREATE TRIGGER bookings_lock_immutable_columns
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.bookings_lock_immutable_columns();

-- 3. Refund tracking for cancellations (written by /api/bookings/cancel after Stripe
--    accepts the refund). The app still cancels correctly if this hasn't been applied.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_by text,
  ADD COLUMN IF NOT EXISTS refund_id text,
  ADD COLUMN IF NOT EXISTS refund_amount_cents integer,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
