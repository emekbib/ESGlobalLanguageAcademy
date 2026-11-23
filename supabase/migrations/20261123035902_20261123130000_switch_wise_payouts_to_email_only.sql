/*
# Switch Wise payouts from bank details to email-only

## Summary
Switches teacher payout storage from three bank-detail columns
(account holder, bank name, account number) to a single payout_email
column. Teachers now enter only their payout email; Wise handles
bank details on its own site via email claim flow.

## Changes
1. teacher_profiles
   - ADD COLUMN payout_email text (nullable)
   - DROP COLUMN payout_account_holder
   - DROP COLUMN payout_bank_name
   - DROP COLUMN payout_account_number

## Security
No RLS or policy changes. Existing policies and grants on
teacher_profiles remain in effect. No new tables or functions.

## Notes
- payout_email is nullable so existing teacher_profiles rows are
  not broken by the migration.
- The old bank-detail columns are dropped because they are no
  longer referenced by any application code.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS payout_email text;

ALTER TABLE teacher_profiles
  DROP COLUMN IF EXISTS payout_account_holder,
  DROP COLUMN IF EXISTS payout_bank_name,
  DROP COLUMN IF EXISTS payout_account_number;
