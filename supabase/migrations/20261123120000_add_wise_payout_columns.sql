/*
# Add Wise payout details columns to teacher_profiles

Tutors are paid monthly via Wise, directly to their bank account.
These columns store the teacher's bank details so payouts reach them.

1. New columns on teacher_profiles
- payout_account_holder (text, nullable) — full name on the bank account.
- payout_bank_name (text, nullable) — name of the teacher's bank.
- payout_account_number (text, nullable) — bank account number for Wise transfers.

2. Security
- RLS already exists on teacher_profiles. These columns are personal financial
  data: only the owning teacher (user_id = auth.uid()) and admins should be
  able to read them. The existing SELECT policy on teacher_profiles already
  scopes reads to the owning teacher; admins access via the service role.
- UPDATE is already restricted to the owning teacher via existing policies.
  No additional policy changes are needed because column-level access is
  governed by the same row-level policies that protect the rest of the row.
*/

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS payout_account_holder text,
  ADD COLUMN IF NOT EXISTS payout_bank_name text,
  ADD COLUMN IF NOT EXISTS payout_account_number text;
