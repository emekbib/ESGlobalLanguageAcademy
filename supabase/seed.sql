-- ====================================================================
-- ESGlobal Language Academy: Database Seed Script
-- Includes:
-- 2 Admin Accounts (Super Admins)
-- 5 Fake Students (with authentic diaspora / heritage names)
-- 2 Fake Teachers (Amharic, Afaan Oromo)
-- ====================================================================

-- 1. Admins
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@esglobal.test', '{"role": "admin"}', crypt('admin12345', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000002', 'estephanos@esglobal.test', '{"role": "admin"}', crypt('admin12345', gen_salt('bf')), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET 
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  role = EXCLUDED.role;

INSERT INTO public.profiles (user_id, role, full_name, avatar_url)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'ESGlobal Operations', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=240&auto=format&fit=crop'),
  ('a0000000-0000-0000-0000-000000000002', 'admin', 'Estephanos Fantahun', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=240&auto=format&fit=crop')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin',
  full_name = EXCLUDED.full_name;

-- 2. 5 Fake Students
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'selamawit@student.test', '{"role": "student"}', crypt('student123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000002', 'samuel@student.test', '{"role": "student"}', crypt('student123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000003', 'tolawak@student.test', '{"role": "student"}', crypt('student123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000004', 'farhan@student.test', '{"role": "student"}', crypt('student123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000005', 'eden@student.test', '{"role": "student"}', crypt('student123', gen_salt('bf')), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET 
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO public.profiles (user_id, role, full_name, avatar_url)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'student', 'Selamawit Bekele', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=240&auto=format&fit=crop'),
  ('b0000000-0000-0000-0000-000000000002', 'student', 'Samuel Ghebre', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=240&auto=format&fit=crop'),
  ('b0000000-0000-0000-0000-000000000003', 'student', 'Tolawak Benti', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=240&auto=format&fit=crop'),
  ('b0000000-0000-0000-0000-000000000004', 'student', 'Farhan Abdi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=240&auto=format&fit=crop'),
  ('b0000000-0000-0000-0000-000000000005', 'student', 'Eden Michael', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=240&auto=format&fit=crop')
ON CONFLICT (user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- 3. 2 Fake Teachers (Amharic, Afaan Oromo)
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'bethelhem@teacher.test', '{"role": "teacher"}', crypt('teacher123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000005', 'chaltu@teacher.test', '{"role": "teacher"}', crypt('teacher123', gen_salt('bf')), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET 
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO public.profiles (user_id, role, full_name, avatar_url)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'teacher', 'Bethelhem Mengistu', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop'),
  ('c0000000-0000-0000-0000-000000000005', 'teacher', 'Chaltu Deressa', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- 4. Teacher Profiles (Mix of Track 1 Community & Track 2 Professional)
INSERT INTO public.teacher_profiles (
  id, user_id, bio, languages_taught, languages_spoken, hourly_rate, years_experience, 
  teacher_type, application_status, is_published, video_intro_url, specialties, credentials, created_at, updated_at
)
VALUES 
  (
    'd0000000-0000-0000-0000-000000000001', 
    'c0000000-0000-0000-0000-000000000001', 
    'Native Amharic educator and linguistics graduate specializing in Fidel script literacy, conversational fluency, and diaspora youth instruction.',
    ARRAY['Amharic'], 
    ARRAY['Amharic', 'English'], 
    28, 6, 'professional', 'approved', true,
    'https://assets.mixkit.co/videos/preview/mixkit-online-learning-teacher-with-tablet-41221-large.mp4',
    ARRAY['Fidel Script', 'Conversational Amharic', 'Grammar & Culture'],
    ARRAY['BA in Linguistics — Addis Ababa University', 'Certified Amharic Second Language Instructor'],
    now(), now()
  ),
  (
    'd0000000-0000-0000-0000-000000000005', 
    'c0000000-0000-0000-0000-000000000005', 
    'Community tutor specializing in fun, interactive Afaan Oromo lessons for children, teens, and diaspora parents.',
    ARRAY['Afaan Oromo'], 
    ARRAY['Afaan Oromo', 'English'], 
    22, 2, 'community_tutor', 'approved', true,
    'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-a-video-call-with-her-laptop-42998-large.mp4',
    ARRAY['Children & Youth', 'Qubee Fun', 'Daily Greetings'],
    ARRAY[]::text[],
    now(), now()
  )
ON CONFLICT (user_id) DO UPDATE SET 
  bio = EXCLUDED.bio,
  languages_taught = EXCLUDED.languages_taught,
  hourly_rate = EXCLUDED.hourly_rate,
  teacher_type = EXCLUDED.teacher_type,
  application_status = EXCLUDED.application_status,
  is_published = EXCLUDED.is_published;
