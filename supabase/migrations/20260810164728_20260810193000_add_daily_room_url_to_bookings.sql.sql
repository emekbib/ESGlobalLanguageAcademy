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
