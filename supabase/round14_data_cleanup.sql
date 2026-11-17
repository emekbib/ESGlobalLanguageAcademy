-- Round 14 Data Cleanup — idempotent. Safe to re-run; each statement is a no-op
-- if the target row/content no longer exists.
-- DO NOT run automatically. The owner applies this against production.

-- (c) Remove the QA test sentence from Estephanos Mekbib's teacher_profiles bio
--     (teacher_profiles row id = dde171b6...).  Only the sentence and the extra
--     space it leaves behind are removed; the rest of the bio is preserved.
UPDATE teacher_profiles
   SET bio = btrim(regexp_replace(bio, '\s*QA-verified bio update for Round 4 testing\.\s*', ' ', 'g'))
 WHERE id::text LIKE 'dde171b6%'
   AND bio LIKE '%QA-verified bio update for Round 4 testing.%';

-- Fuzzy fallback: if the row id above doesn't match exactly, try by user_id join.
UPDATE teacher_profiles
   SET bio = btrim(regexp_replace(bio, '\s*QA-verified bio update for Round 4 testing\.\s*', ' ', 'g'))
 WHERE user_id IN (
     SELECT user_id FROM profiles WHERE full_name ILIKE '%estephanos%'
 )
   AND bio LIKE '%QA-verified bio update for Round 4 testing.%';

-- (b) Remove stale QA test conversations by their unique content strings.
--     These are identified by exact content so no real messages are touched.

-- QA Teacher — Round 9 leftover
DELETE FROM messages
 WHERE content = 'Round 9 QA test message 2 — second message, sent to test delete of message 1.';

-- Rahel Teacher77088 — placeholder conversation
DELETE FROM messages
 WHERE content = 'No messages yet'
   AND sender_id IN (
     SELECT user_id FROM profiles WHERE full_name ILIKE '%rahel%teacher77088%'
        OR full_name ILIKE '%rahel%'
   );

-- QA Student — Round 9 persistence check (appears in teacher's conversation list)
DELETE FROM messages
 WHERE content = 'Round 9 persistence check';


