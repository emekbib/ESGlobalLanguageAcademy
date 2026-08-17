/*
# Prevent overlapping active bookings

1. Data integrity
- Add a PostgreSQL exclusion constraint to `bookings` that rejects any overlapping
  time range for the same teacher while a booking is pending or confirmed.
- This is stronger than matching exact start/end values: a 30-minute booking cannot
  overlap a 60-minute booking for the same teacher.

2. Security
- No RLS policy changes. Existing owner and teacher policies remain in place.

3. Important notes
- The database is the authoritative race-condition guard. Concurrent inserts are
  serialized by PostgreSQL and only one overlapping active booking can succeed.
- Cancelled and completed bookings are excluded, so they do not block future slots.
- All booking range values remain timestamptz values supplied as UTC instants.
*/

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_teacher_active_no_overlap'
      AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_teacher_active_no_overlap
      EXCLUDE USING gist (
        teacher_id WITH =,
        tstzrange(start_time_utc, end_time_utc, '[)') WITH &&
      )
      WHERE (status IN ('pending', 'confirmed'));
  END IF;
END $$;
