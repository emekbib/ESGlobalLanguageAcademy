-- Remove admin moderation restrictions and auto-approve everyone
ALTER TABLE teacher_profiles ALTER COLUMN application_status SET DEFAULT 'approved';
ALTER TABLE teacher_profiles ALTER COLUMN is_published SET DEFAULT true;

-- Grant permissions back
GRANT UPDATE (is_published, application_status) ON teacher_profiles TO authenticated;

-- Update all existing pending profiles to approved
UPDATE teacher_profiles SET application_status = 'approved', is_published = true;
