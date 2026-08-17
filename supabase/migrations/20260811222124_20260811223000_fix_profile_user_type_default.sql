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