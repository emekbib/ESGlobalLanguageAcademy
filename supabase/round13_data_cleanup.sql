-- Round 13 Data Cleanup — idempotent. Safe to re-run; each statement is a no-op
-- if the target row no longer exists.

-- (a) Delete leftover cancelled test booking.
DELETE FROM bookings
  WHERE id = '6483b043-8647-45b9-959d-1154cd49b0b9'
    AND status = 'cancelled';

-- (b) Clean stale /messages conversations for QA Teacher and Rahel Teacher77088.
--    These profiles no longer exist in the database, so no rows are expected.
DELETE FROM messages
  WHERE sender_id IN (
    SELECT user_id FROM profiles
     WHERE full_name IN ('QA Teacher', 'Rahel Teacher77088')
  )
  OR receiver_id IN (
    SELECT user_id FROM profiles
     WHERE full_name IN ('QA Teacher', 'Rahel Teacher77088')
  );

-- (c) Remove the QA test sentence from Estephanos Mekbib's pending Track 2 bio.
UPDATE profiles
   SET bio = REPLACE(bio, 'QA-verified bio update for Round 4 testing.', '')
 WHERE full_name = 'Estephanos Mekbib'
   AND bio LIKE '%QA-verified bio update for Round 4 testing.%';
