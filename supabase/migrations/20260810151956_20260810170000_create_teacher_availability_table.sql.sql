/*
# Create teacher_availability table

1. New Tables
- `teacher_availability`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `teacher_id` (uuid, required, references teacher_profiles(id) ON DELETE CASCADE)
    — the teacher profile this availability window belongs to.
  - `weekday` (smallint, required, 0=Sunday … 6=Saturday) — the day of the week
    this recurring window applies to, expressed in the teacher's local timezone.
  - `start_time` (time, required) — start of the availability window in the
    teacher's local timezone. Stored as a time-of-day value (no date, no tz).
  - `end_time` (time, required) — end of the availability window in the
    teacher's local timezone. Must be after start_time.
  - `timezone` (text, required) — IANA timezone identifier (e.g. 'America/New_York')
    for the teacher's local timezone. Used to convert recurring windows to UTC
    for display to students in their own browser timezone.
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Constraints
- `teacher_availability_time_order_check` — end_time must be strictly after start_time.
- `teacher_availability_weekday_check` — weekday must be 0–6.

3. Indexes
- `teacher_availability_teacher_id_idx` — index on teacher_id for fast lookups
  when loading a teacher's public profile.

4. Security
- Enable RLS on `teacher_availability`.
- SELECT: anyone (anon + authenticated) can read availability rows so students
  can see a teacher's schedule on the public profile. Availability is only useful
  alongside a published teacher profile; the public profile page gates display
  on is_published = true.
- INSERT / UPDATE / DELETE: only the teacher who owns the availability row can
  modify it. Ownership is checked through teacher_profiles: the authenticated
  user must own the teacher_profiles row that this availability row references.

5. Important Notes
- Times are stored as local time-of-day values (Postgres `time` type), NOT as
  UTC timestamps. The `timezone` column records which timezone those local
  times are in. The application converts recurring (weekday, start_time, end_time)
  windows into concrete UTC datetimes for a given date range, then converts
  again to the viewing student's browser timezone for display.
- This design correctly handles DST transitions: the teacher's timezone offset
  may differ between the start and end of a 14-day window, and the conversion
  logic accounts for that by evaluating each date individually.
- A teacher can have multiple windows per weekday (e.g. morning + evening).
- Duplicate or overlapping windows are not prevented at the DB level; the UI
  should guide teachers to avoid overlaps.
*/

CREATE TABLE IF NOT EXISTS teacher_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  weekday smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE teacher_availability ENABLE ROW LEVEL SECURITY;

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_availability_time_order_check'
      AND conrelid = 'teacher_availability'::regclass
  ) THEN
    ALTER TABLE teacher_availability
      ADD CONSTRAINT teacher_availability_time_order_check CHECK (end_time > start_time);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_availability_weekday_check'
      AND conrelid = 'teacher_availability'::regclass
  ) THEN
    ALTER TABLE teacher_availability
      ADD CONSTRAINT teacher_availability_weekday_check CHECK (weekday >= 0 AND weekday <= 6);
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS teacher_availability_teacher_id_idx ON teacher_availability(teacher_id);

-- Policies
DROP POLICY IF EXISTS "select_teacher_availability" ON teacher_availability;
CREATE POLICY "select_teacher_availability"
  ON teacher_availability FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_teacher_availability" ON teacher_availability;
CREATE POLICY "insert_own_teacher_availability"
  ON teacher_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = teacher_availability.teacher_id
        AND tp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_teacher_availability" ON teacher_availability;
CREATE POLICY "update_own_teacher_availability"
  ON teacher_availability FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = teacher_availability.teacher_id
        AND tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = teacher_availability.teacher_id
        AND tp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_teacher_availability" ON teacher_availability;
CREATE POLICY "delete_own_teacher_availability"
  ON teacher_availability FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = teacher_availability.teacher_id
        AND tp.user_id = auth.uid()
    )
  );
