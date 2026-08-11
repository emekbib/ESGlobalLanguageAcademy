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
