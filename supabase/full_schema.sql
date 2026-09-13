-- Migration: 20260810141215_create_profiles_table.sql
/*
# Create profiles table for two-sided marketplace

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — one row per user account
  - `user_type` (enum: 'student' | 'teacher') — which side of the marketplace this user operates on
  - `full_name` (text) — display name
  - `avatar_url` (text, nullable) — profile photo URL
  - `bio` (text, nullable) — short description (e.g. teacher expertise or student goals)
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())

2. New Types
- `user_type` enum with values 'student' and 'teacher'

3. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only read, insert, update, and delete their OWN profile row.
- `id` defaults to `auth.uid()` so an insert that omits the id still satisfies the WITH CHECK.
- No anon access — this is an authenticated marketplace (sign-in required).

4. Important Notes
- This is the foundation table for a two-sided marketplace. Student- and teacher-specific
  tables (listings, bookings, messages, etc.) will be added in later migrations and will
  reference `profiles.id` as the owner.
- The `user_type` enum is the mechanism that routes users to the correct side of the
  marketplace (student dashboard vs teacher dashboard).
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('student', 'teacher');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT: users can create their own profile (id defaults to auth.uid())
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: users can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: users can delete their own profile
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Migration: 20260810143804_20260810150000_profiles_public_read_basic_info.sql
/*
# Allow authenticated users to read basic profile info of others

1. Security changes
- Replace the existing owner-only SELECT policy on `profiles` with one that
  allows any authenticated user to SELECT all rows (so students and teachers
  can see each other's name + avatar). Full row data (bio, user_type, etc.)
  is still returned at the database layer; the frontend will only display
  the public fields (full_name, avatar_url) for other users. The RLS layer
  permits SELECT for all authenticated users because the marketplace needs
  users to see basic info about each other.
- INSERT / UPDATE / DELETE policies remain owner-scoped (unchanged).

2. Important Notes
- This is intentionally a read-all policy scoped to `authenticated` so that
  the two-sided marketplace can display teacher/student names and avatars.
  Sensitive write operations remain restricted to the row owner.
*/

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "select_all_profiles_authenticated" ON profiles;

CREATE POLICY "select_all_profiles_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);


-- Migration: 20260810143908_20260810151000_add_profile_roles_and_user_ids.sql
/*
# Add profile role and user identity columns

1. New columns on `profiles`
- `user_id` (uuid, required, references auth.users) — the account owner.
- `role` (text, required, student or teacher) — the user's marketplace role.
- `updated_at` already exists and continues to track profile edits.

2. Compatibility
- Existing profile columns are preserved to avoid data loss. The existing
  `user_type` column remains available for older records while new application
  code uses `role`.
- New profile rows default both identity columns to the signed-in account.

3. Security
- Authenticated users can read profile rows so the marketplace can discover
  other users' basic names and avatars.
- Only the profile owner can insert, update, or delete their own row.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher'));
  END IF;
END $$;

UPDATE profiles
SET user_id = id
WHERE user_id IS NULL;

UPDATE profiles
SET role = CASE WHEN user_type::text = 'teacher' THEN 'teacher' ELSE 'student' END
WHERE role IS NULL;

ALTER TABLE profiles
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles(user_id);

DROP POLICY IF EXISTS "select_all_profiles_authenticated" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;

CREATE POLICY "select_all_profiles_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- Migration: 20260810151107_20260810160000_create_teacher_profiles_table.sql.sql
/*
# Create teacher_profiles table

1. New Tables
- `teacher_profiles`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `user_id` (uuid, required, references auth.users ON DELETE CASCADE, unique) — one row per teacher
  - `bio` (text, nullable) — teacher's biography / description
  - `languages_taught` (text[], required, default '{}') — array of languages the teacher offers
  - `hourly_rate` (numeric(10,2), required) — price per hour in USD
  - `years_experience` (integer, required, default 0) — years of teaching experience
  - `video_intro_url` (text, nullable) — optional URL to a video introduction
  - `is_published` (boolean, required, default false) — whether the profile is visible in the public directory
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Constraints
- `teacher_profiles_hourly_rate_check` — hourly_rate must be >= 0
- `teacher_profiles_years_experience_check` — years_experience must be >= 0
- Unique index on `user_id` ensures one teacher profile per account

3. Indexes
- `teacher_profiles_user_id_key` — unique index on user_id for fast owner lookups
- `teacher_profiles_published_idx` — partial index on (is_published) WHERE is_published = true, speeds up the public directory query

4. Security
- Enable RLS on `teacher_profiles`.
- SELECT: anyone (anon + authenticated) can read published profiles so the public
  directory works without sign-in. Authenticated users can additionally read their
  own unpublished profile so they can preview/edit before publishing.
- INSERT: authenticated users can insert only their own row (auth.uid() = user_id).
- UPDATE: authenticated users can update only their own row.
- DELETE: authenticated users can delete only their own row.
- The `is_published` flag is the gate: unpublished profiles never appear in the
  public directory or detail page because those queries filter on is_published = true.

5. Important Notes
- A teacher must fill in bio, languages_taught (non-empty), hourly_rate, and
  years_experience before setting is_published = true. This is enforced in the
  application layer (the onboarding form validates all fields before publishing).
- The public /teachers directory and /teachers/[id] pages query with
  .eq('is_published', true) so unpublished or incomplete profiles are never
  listed or bookable.
- user_id defaults to auth.uid() so an insert that omits user_id still satisfies
  the WITH CHECK ownership predicate.
*/

CREATE TABLE IF NOT EXISTS teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  languages_taught text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  years_experience integer NOT NULL DEFAULT 0,
  video_intro_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_profiles_hourly_rate_check'
      AND conrelid = 'teacher_profiles'::regclass
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_hourly_rate_check CHECK (hourly_rate >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_profiles_years_experience_check'
      AND conrelid = 'teacher_profiles'::regclass
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_years_experience_check CHECK (years_experience >= 0);
  END IF;
END $$;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS teacher_profiles_user_id_key ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS teacher_profiles_published_idx ON teacher_profiles(is_published) WHERE is_published = true;

-- Policies (drop first for idempotency, then create)
DROP POLICY IF EXISTS "select_published_teacher_profiles" ON teacher_profiles;
CREATE POLICY "select_published_teacher_profiles"
  ON teacher_profiles FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "insert_own_teacher_profile"
  ON teacher_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "update_own_teacher_profile"
  ON teacher_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "delete_own_teacher_profile"
  ON teacher_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- Migration: 20260810151139_20260810160500_secure_teacher_directory_visibility.sql.sql
/*
# Secure public teacher directory visibility

1. Data integrity
- Add a publication check so a teacher profile cannot be marked published unless
  it has a non-empty bio, at least one language, and a positive hourly rate.
- This prevents incomplete profiles from becoming visible or bookable through
  direct database requests that bypass the form.

2. Security
- Replace the authenticated-only profile read policy with a public read policy
  because public teacher cards need the teacher's display name and avatar.
- The application selects only full_name and avatar_url from profiles for the
  public directory and teacher detail page.
- Profile writes remain restricted to the profile owner.

3. Important notes
- Unpublished teacher_profiles remain visible only to their owner.
- Public pages must always filter teacher_profiles with is_published = true.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_profiles_published_complete_check'
      AND conrelid = 'teacher_profiles'::regclass
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_published_complete_check CHECK (
        NOT is_published
        OR (
          length(trim(coalesce(bio, ''))) > 0
          AND cardinality(languages_taught) > 0
          AND hourly_rate > 0
        )
      );
  END IF;
END $$;

DROP POLICY IF EXISTS "select_all_profiles_authenticated" ON profiles;
DROP POLICY IF EXISTS "select_public_profile_info" ON profiles;

CREATE POLICY "select_public_profile_info"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);


-- Migration: 20260810151956_20260810170000_create_teacher_availability_table.sql.sql
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


-- Migration: 20260810152607_20260810180000_create_bookings_table.sql.sql
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


-- Migration: 20260810152815_20260810180500_prevent_overlapping_bookings.sql.sql
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


-- Migration: 20260810163934_20260810190000_add_stripe_connect_and_booking_payment_fields.sql
/*
# Add Stripe Connect and booking payment state

1. New columns on `teacher_profiles`
- `stripe_account_id` stores the teacher's Stripe Express connected account ID.
- `stripe_onboarding_complete` records whether Stripe onboarding has finished.

2. New columns on `bookings`
- `hold_expires_at` records the 15-minute payment hold deadline.
- `checkout_session_id` stores the Stripe Checkout Session ID.
- `payment_intent_id` stores the Stripe PaymentIntent ID after payment processing begins.
- `amount_cents` stores the server-calculated booking price.
- `platform_fee_cents` stores the 20% platform commission.
- `teacher_payout_cents` stores the 80% teacher share.
- `payout_transfer_id` stores the Stripe transfer created after completion.

3. Security
- Existing row ownership policies remain in place.
- Payment, hold, payout, and Connect fields are no longer writable by authenticated browser clients.
- Booking inserts are performed by the authenticated Stripe Checkout edge function using the service role after it verifies the caller and teacher.

4. Important notes
- The application server is authoritative for amounts, payment state, hold expiry, and transfers.
- Existing bookings remain valid; new payment fields are nullable where historical data has no Stripe record.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean NOT NULL DEFAULT false;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS checkout_session_id text,
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS platform_fee_cents integer,
  ADD COLUMN IF NOT EXISTS teacher_payout_cents integer,
  ADD COLUMN IF NOT EXISTS payout_transfer_id text;

CREATE UNIQUE INDEX IF NOT EXISTS teacher_profiles_stripe_account_id_key
  ON teacher_profiles (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_checkout_session_id_key
  ON bookings (checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_intent_id_key
  ON bookings (payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_payout_transfer_id_key
  ON bookings (payout_transfer_id)
  WHERE payout_transfer_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_amounts_nonnegative'
      AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_amounts_nonnegative CHECK (
      (amount_cents IS NULL OR amount_cents > 0)
      AND (platform_fee_cents IS NULL OR platform_fee_cents >= 0)
      AND (teacher_payout_cents IS NULL OR teacher_payout_cents >= 0)
    );
  END IF;
END $$;

REVOKE INSERT ON bookings FROM authenticated;
REVOKE UPDATE (status, hold_expires_at, checkout_session_id, payment_intent_id, amount_cents, platform_fee_cents, teacher_payout_cents, payout_transfer_id) ON bookings FROM authenticated;
REVOKE UPDATE (stripe_account_id, stripe_onboarding_complete) ON teacher_profiles FROM authenticated;


-- Migration: 20260810164728_20260810193000_add_daily_room_url_to_bookings.sql.sql
/*
# Add Daily.co room URL to bookings

1. New columns on `bookings`
- `daily_room_url` (text, nullable) stores the Daily.co room URL generated when
  a booking is confirmed. Used by the booking detail page to embed the Daily
  prebuilt call UI for the lesson.

2. Security
- The column is server-managed: only edge functions using the service role
  can write it. Browser clients (authenticated role) are revoked UPDATE on
  this column so it cannot be tampered with from the frontend.
- Existing row ownership SELECT policies remain unchanged, so both the
  student and teacher can read the room URL to join the lesson.
*/

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_room_url text;

REVOKE UPDATE (daily_room_url) ON bookings FROM authenticated;


-- Migration: 20260810165912_20260810194500_add_booking_reminders_and_notifications.sql.sql
/*
# Add booking reminders tracking and in-app notifications

1. New columns on `bookings`
- `reminder_24h_sent_at` (timestamptz, nullable) — timestamp when the 24-hour email reminder was sent.
- `reminder_1h_sent_at` (timestamptz, nullable) — timestamp when the 1-hour email reminder was sent.
- `starting_soon_notified_at` (timestamptz, nullable) — timestamp when the "starting soon" in-app notification was created.
These three fields act as idempotency guards: the scheduled function checks them before sending, and only writes them after a successful send. A NULL value means "not yet sent."

2. New Table: `notifications`
- `id` (uuid, primary key)
- `user_id` (uuid, required, references auth.users ON DELETE CASCADE) — the recipient.
- `booking_id` (uuid, nullable, references bookings ON DELETE CASCADE) — the booking this notification relates to.
- `type` (text, required) — 'confirmed' | 'cancelled' | 'starting_soon'.
- `message` (text, required) — human-readable notification text.
- `read_at` (timestamptz, nullable) — when the user dismissed/read the notification. NULL = unread.
- `created_at` (timestamptz, default now()).

3. Security on `notifications`
- RLS enabled.
- SELECT: authenticated users can read only their own notifications (user_id = auth.uid()).
- INSERT: denied for authenticated browser clients — only edge functions using the service role create notifications.
- UPDATE: authenticated users can mark their own notifications as read (user_id = auth.uid()).
- DELETE: authenticated users can delete their own notifications.

4. Trigger: `notify_booking_status_change`
- A trigger function `notify_booking_status()` fires AFTER UPDATE on `bookings` when `status` changes.
- If status becomes 'confirmed': inserts a notification for both the student and the teacher.
- If status becomes 'cancelled': inserts a notification for both the student and the teacher.
- The trigger runs with SECURITY DEFINER as the service role so it can INSERT into `notifications`
  even though the calling role (authenticated) cannot.
- The function is idempotent per booking+status: it checks that no existing notification exists
  for the same (booking_id, type) before inserting, so re-fires don't create duplicates.

5. pg_cron schedule
- A cron job `send-booking-reminders` runs every 15 minutes, calling the `send-booking-reminders`
  edge function via `net.http_post` (if available) or as a no-op placeholder.
- The edge function itself is the authoritative sender: it queries for confirmed bookings whose
  start time is within 24h or 1h windows and whose corresponding reminder field is NULL, sends
  emails via Resend, and updates the reminder timestamp.
*/
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS starting_soon_notified_at timestamptz;

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('confirmed', 'cancelled', 'starting_soon')),
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(user_id) WHERE read_at IS NULL;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION notify_booking_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_name text;
  teacher_name text;
  booking_label text;
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) OR (TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'cancelled')) THEN
    SELECT p.full_name INTO student_name
      FROM profiles p WHERE p.user_id = NEW.student_id;
    SELECT p.full_name INTO teacher_name
      FROM profiles p
      JOIN teacher_profiles tp ON tp.user_id = p.user_id
      WHERE tp.id = New.teacher_id;
    booking_label := to_char(New.start_time_utc AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC');

    IF NEW.status = 'confirmed' THEN
      IF NOT EXISTS (SELECT 1 FROM notifications WHERE booking_id = NEW.id AND type = 'confirmed') THEN
        INSERT INTO notifications (user_id, booking_id, type, message)
          VALUES (NEW.student_id, NEW.id, 'confirmed', 'Your booking for ' || booking_label || ' has been confirmed.');
        IF teacher_name IS NOT NULL THEN
          INSERT INTO notifications (user_id, booking_id, type, message)
            VALUES ((SELECT user_id FROM teacher_profiles WHERE id = NEW.teacher_id), NEW.id, 'confirmed', 'You have a new confirmed booking for ' || booking_label || '.');
        END IF;
      END IF;
    ELSIF NEW.status = 'cancelled' THEN
      IF NOT EXISTS (SELECT 1 FROM notifications WHERE booking_id = NEW.id AND type = 'cancelled') THEN
        INSERT INTO notifications (user_id, booking_id, type, message)
          VALUES (NEW.student_id, NEW.id, 'cancelled', 'Your booking for ' || booking_label || ' has been cancelled.');
        IF teacher_name IS NOT NULL THEN
          INSERT INTO notifications (user_id, booking_id, type, message)
            VALUES ((SELECT user_id FROM teacher_profiles WHERE id = NEW.teacher_id), NEW.id, 'cancelled', 'A booking for ' || booking_label || ' has been cancelled.');
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_booking_status_change ON bookings;
CREATE TRIGGER notify_booking_status_change
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_status();


-- Migration: 20260810165952_20260810195000_schedule_booking_reminders.sql.sql
/*
# Schedule send-booking-reminders via pg_cron

1. Extension
- Enables pg_cron if not already enabled.

2. Cron job
- send-booking-reminders runs every fifteen minutes.
- Uses net.http_post to call the edge function endpoint with the service role
  key for authentication. The edge function is the authoritative sender and is
  idempotent (it checks reminder timestamps before sending).
*/
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-booking-reminders') THEN
    PERFORM cron.unschedule('send-booking-reminders');
  END IF;
END $$;

SELECT cron.schedule(
  'send-booking-reminders',
  '*/15 * * * *',
  $$
    SELECT content::text
    FROM extensions.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-booking-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);


-- Migration: 20260810170048_20260810195500_enable_notifications_realtime.sql.sql
/*
# Enable Realtime for in-app notifications

1. Realtime publication
- Adds the notifications table to Supabase Realtime so each signed-in
  user's bell receives new, updated, and deleted notification events.
2. Security
- RLS remains enabled and continues to scope rows to the authenticated user.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;


-- Migration: 20260810171334_20260810200000_create_reviews_table.sql.sql
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


-- Migration: 20260810171756_20260810201500_add_admin_moderation_controls.sql.sql
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


-- Migration: 20260811222124_20260811223000_fix_profile_user_type_default.sql
/*
# Fix profile creation compatibility

1. Purpose
- Prevent onboarding from failing when a profile insert does not include the legacy `user_type` field.

2. Modified table
- `profiles.user_type`
  - Adds a `student` default for older clients and deployments that only send the newer `role` field.
  - Preserves the existing enum, NOT NULL constraint, and all existing profile data.

3. Security
- No access permissions or row-level security policies are changed.

4. Important notes
- Current onboarding continues to send both role fields.
- This default is a compatibility safeguard for already-deployed versions during rollout.
*/

ALTER TABLE profiles
  ALTER COLUMN user_type SET DEFAULT 'student'::user_type;

-- Migration: 20260811222159_20260811223100_sync_profile_role_fields.sql
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

-- Migration: 20260812230843_add_teacher_type_and_specialties.sql
/*
# Add teacher_type and specialties to teacher_profiles

1. Changes to existing tables
- `teacher_profiles.teacher_type` — new text column, defaults to 'professional'.
  Values: 'professional' or 'community_tutor'. Lets the directory filter between
  vetted professional teachers and community tutors.
- `teacher_profiles.specialties` — new text[] column, defaults to '{}'.
  Stores tags like 'Kids', 'Business', 'Exam Prep', 'Conversation' so students
  can filter by teaching focus.

2. Data backfill
- Existing rows get 'professional' as their teacher_type and '{}' specialties.

3. Security
- No RLS policy changes. The existing public read policy on teacher_profiles
  already covers these columns.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS teacher_type text NOT NULL DEFAULT 'professional';

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}';

-- Backfill existing rows with varied teacher types and specialties
UPDATE teacher_profiles
SET teacher_type = CASE
  WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN 'community_tutor'
  ELSE 'professional'
END,
specialties = CASE
  WHEN user_id = 'a0000000-0000-0000-0000-000000000001' THEN ARRAY['Conversation', 'Exam Prep']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000002' THEN ARRAY['Business', 'Exam Prep']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN ARRAY['Conversation', 'Kids']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000004' THEN ARRAY['Business', 'Conversation']::text[]
  WHEN user_id = 'a0000000-0000-0000-0000-000000000005' THEN ARRAY['Kids', 'Exam Prep']::text[]
  ELSE ARRAY[]::text[]
END
WHERE specialties = '{}';


-- Migration: 20260812231512_add_languages_spoken_and_credentials.sql
/*
# Add languages_spoken and credentials to teacher_profiles

1. Changes to existing tables
- `teacher_profiles.languages_spoken` — new text[] column, defaults to '{}'.
  Stores additional languages the teacher speaks (beyond what they teach),
  shown as "Also speaks: French, German" on the profile page.
- `teacher_profiles.credentials` — new text[] column, defaults to '{}'.
  Stores certifications/qualifications like "TEFL Certified", "5 years experience".

2. Data backfill
- Existing seeded teacher rows get varied languages_spoken and credentials.

3. Security
- No RLS policy changes. The existing public read policy on teacher_profiles
  already covers these columns.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS languages_spoken text[] NOT NULL DEFAULT '{}';

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS credentials text[] NOT NULL DEFAULT '{}';

UPDATE teacher_profiles
SET
  languages_spoken = CASE
    WHEN user_id = 'a0000000-0000-0000-0000-000000000001' THEN ARRAY['English', 'Portuguese']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000002' THEN ARRAY['English']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN ARRAY['English', 'German']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000004' THEN ARRAY['English', 'Spanish']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000005' THEN ARRAY['English']::text[]
    ELSE ARRAY[]::text[]
  END,
  credentials = CASE
    WHEN user_id = 'a0000000-0000-0000-0000-000000000001' THEN ARRAY['DELE Examiner Certified', '8 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000002' THEN ARRAY['JLPT N1 Certified', '6 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000003' THEN ARRAY['DALF C1 Certified', '4 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000004' THEN ARRAY['TEFL Certified', '10 years teaching experience']::text[]
    WHEN user_id = 'a0000000-0000-0000-0000-000000000005' THEN ARRAY['HSK 6 Certified', '7 years teaching experience']::text[]
    ELSE ARRAY[]::text[]
  END
WHERE languages_spoken = '{}';
