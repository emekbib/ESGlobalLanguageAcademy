/*
# Create bookings table

1. New Tables
- `bookings`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `student_id` (uuid, required, references auth.users ON DELETE CASCADE) — the student who booked.
  - `teacher_id` (uuid, required, references teacher_profiles(id) ON DELETE CASCADE) — the teacher being booked.
  - `start_time_utc` (timestamptz, required) — lesson start in UTC.
  - `end_time_utc` (timestamptz, required) — lesson end in UTC.
  - `status` (text, required, default 'pending') — pending | confirmed | completed | cancelled.
  - `created_at` (timestamptz, default now())

2. Constraints
- `bookings_status_check` — status must be one of pending, confirmed, completed, cancelled.
- `bookings_time_order_check` — end_time_utc must be after start_time_utc.
- `bookings_no_overlap` — a partial unique index on (teacher_id, start_time_utc, end_time_utc)
  WHERE status IN ('pending', 'confirmed'). This is the race-condition guard: two students
  clicking the same slot at nearly the same time both attempt an INSERT with the same
  (teacher_id, start_time_utc, end_time_utc). Postgres grants the unique index atomically —
  the first INSERT succeeds, the second gets a unique-violation error that the application
  translates into a clear "slot no longer available" message. Cancelled and completed bookings
  are excluded from the index so they don't block future rebooking of the same slot.

3. Indexes
- `bookings_student_id_idx` — for the student dashboard query.
- `bookings_teacher_id_idx` — for the teacher dashboard query.
- `bookings_no_overlap` — partial unique index described above.

4. Security
- Enable RLS on `bookings`.
- SELECT: a student can read their own bookings (student_id = auth.uid()); a teacher can
  read bookings for their teacher profile (via EXISTS check on teacher_profiles.user_id).
- INSERT: only authenticated students can insert a booking for themselves (student_id = auth.uid()).
  The teacher_id must reference an existing teacher_profiles row.
- UPDATE: both student and teacher can update the booking (e.g. status changes). Ownership
  is verified for either party.
- DELETE: both student and teacher can delete (cancel) a booking.

5. Important Notes
- The partial unique index is the primary double-booking guard. The application also checks
  for existing overlapping bookings before inserting, but the index is the authoritative
  atomic check that wins under concurrency.
- start_time_utc and end_time_utc are always stored in UTC (timestamptz). The application
  converts from the teacher's local timezone and the student's browser timezone for display only.
- A booking with status 'cancelled' or 'completed' does not block the slot from being rebooked.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  start_time_utc timestamptz NOT NULL,
  end_time_utc timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_status_check'
      AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_time_order_check'
      AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_time_order_check CHECK (end_time_utc > start_time_utc);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS bookings_student_id_idx ON bookings(student_id);
CREATE INDEX IF NOT EXISTS bookings_teacher_id_idx ON bookings(teacher_id);

-- Partial unique index: prevents double-booking for active (pending/confirmed) bookings.
-- Re-applied idempotently: drop + create.
DROP INDEX IF EXISTS bookings_no_overlap;
CREATE UNIQUE INDEX bookings_no_overlap
  ON bookings(teacher_id, start_time_utc, end_time_utc)
  WHERE status IN ('pending', 'confirmed');

-- Policies
DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = bookings.teacher_id AND tp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_booking" ON bookings;
CREATE POLICY "insert_own_booking"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = bookings.teacher_id
    )
  );

DROP POLICY IF EXISTS "update_own_booking" ON bookings;
CREATE POLICY "update_own_booking"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = bookings.teacher_id AND tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = bookings.teacher_id AND tp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_booking" ON bookings;
CREATE POLICY "delete_own_booking"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = bookings.teacher_id AND tp.user_id = auth.uid()
    )
  );
