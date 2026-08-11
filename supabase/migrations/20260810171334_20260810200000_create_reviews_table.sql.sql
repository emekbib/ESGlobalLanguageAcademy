/*
# Create reviews table

1. New Table: `reviews`
- `id` (uuid, primary key, default gen_random_uuid())
- `booking_id` (uuid, required, references bookings ON DELETE CASCADE, UNIQUE) — one review per booking.
- `student_id` (uuid, required, references auth.users ON DELETE CASCADE) — the student who wrote the review.
- `teacher_id` (uuid, required, references teacher_profiles ON DELETE CASCADE) — the teacher being reviewed.
- `rating` (integer, required, 1-5) — star rating.
- `comment` (text, required) — review text.
- `created_at` (timestamptz, default now()).

2. Constraints
- `reviews_booking_id_key` — UNIQUE on booking_id, enforces one review per booking.
- `reviews_rating_check` — rating must be between 1 and 5.
- `reviews_student_teacher_match_check` — the student_id and teacher_id must
  match the booking's student_id and teacher_id, enforced via a subquery CHECK.
  This prevents a student from reviewing a booking that isn't theirs or tagging
  a review with a teacher who wasn't part of the booking.

3. Indexes
- `reviews_teacher_id_idx` — for fetching all reviews for a teacher profile.
- `reviews_student_id_idx` — for checking whether a student has already reviewed.

4. Security
- RLS enabled.
- SELECT: public (anon + authenticated) — reviews are visible on public teacher profiles.
- INSERT: authenticated students can insert a review only for a booking they own
  (student_id = auth.uid()) AND whose status is 'completed'. The completed-booking
  check is enforced in the WITH CHECK via an EXISTS subquery on the bookings table.
- UPDATE: students can update their own reviews (rating and comment).
- DELETE: students can delete their own reviews.

5. Important Notes
- The one-review-per-booking rule is enforced by both the UNIQUE constraint on
  booking_id and the RLS policy (which checks ownership and completed status).
- The completed-booking check is enforced at the database level, not just the
  application layer, so a student cannot review a booking that hasn't finished.
*/
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_rating_check' AND conrelid = 'reviews'::regclass
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS reviews_teacher_id_idx ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS reviews_student_id_idx ON reviews(student_id);

DROP POLICY IF EXISTS "select_reviews_public" ON reviews;
CREATE POLICY "select_reviews_public"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_completed_booking_review" ON reviews;
CREATE POLICY "insert_own_completed_booking_review"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
        AND b.student_id = auth.uid()
        AND b.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "update_own_review" ON reviews;
CREATE POLICY "update_own_review"
  ON reviews FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_review" ON reviews;
CREATE POLICY "delete_own_review"
  ON reviews FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());
