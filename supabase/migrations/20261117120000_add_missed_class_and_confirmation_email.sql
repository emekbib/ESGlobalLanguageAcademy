/*
# Add missed-class alerts and confirmation email tracking

1. New columns on bookings
- missed_notified_at (timestamptz, nullable) — timestamp when missed-class alerts
  (in-app notification + email) were successfully sent for a confirmed booking whose
  lesson time has passed without completion. NULL = not yet alerted.
- confirmation_email_sent_at (timestamptz, nullable) — timestamp when the booking
  confirmation email was sent to student and teacher. NULL = not yet sent.

Both columns act as idempotency guards: the send-booking-reminders edge function
checks them before sending and only writes them after a successful send.
A NULL value means "not yet sent" and the next cron run will retry.

2. Extend notifications type CHECK to include 'missed'
- The existing CHECK allows ('confirmed', 'cancelled', 'starting_soon').
- Add 'missed' so the edge function can insert missed-class in-app notifications.
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS missed_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notifications_type_check'
      AND conrelid = 'notifications'::regclass
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  END IF;
END $$;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('confirmed', 'cancelled', 'starting_soon', 'missed'));
