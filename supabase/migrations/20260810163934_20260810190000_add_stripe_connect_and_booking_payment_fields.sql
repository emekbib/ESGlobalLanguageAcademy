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
