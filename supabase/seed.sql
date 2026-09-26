-- Seeding 2 Admin Accounts
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin1@esglobal.test', '{"role": "admin"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000002', 'admin2@esglobal.test', '{"role": "admin"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated');

INSERT INTO public.profiles (user_id, role, full_name, avatar_url)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'Super Admin One', 'https://i.pravatar.cc/150?u=admin1'),
  ('a0000000-0000-0000-0000-000000000002', 'admin', 'Super Admin Two', 'https://i.pravatar.cc/150?u=admin2');


-- Seeding 5 Fake Students
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'student1@esglobal.test', '{"role": "student"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000002', 'student2@esglobal.test', '{"role": "student"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000003', 'student3@esglobal.test', '{"role": "student"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000004', 'student4@esglobal.test', '{"role": "student"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000005', 'student5@esglobal.test', '{"role": "student"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated');

INSERT INTO public.profiles (user_id, role, full_name, avatar_url)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'student', 'Alex Johnson', 'https://i.pravatar.cc/150?u=student1'),
  ('b0000000-0000-0000-0000-000000000002', 'student', 'Sarah Lee', 'https://i.pravatar.cc/150?u=student2'),
  ('b0000000-0000-0000-0000-000000000003', 'student', 'Michael Chen', 'https://i.pravatar.cc/150?u=student3'),
  ('b0000000-0000-0000-0000-000000000004', 'student', 'Emily Davis', 'https://i.pravatar.cc/150?u=student4'),
  ('b0000000-0000-0000-0000-000000000005', 'student', 'James Wilson', 'https://i.pravatar.cc/150?u=student5');


-- Seeding 5 Fake Teachers
INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'teacher1@esglobal.test', '{"role": "teacher"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000002', 'teacher2@esglobal.test', '{"role": "teacher"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000003', 'teacher3@esglobal.test', '{"role": "teacher"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000004', 'teacher4@esglobal.test', '{"role": "teacher"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000005', 'teacher5@esglobal.test', '{"role": "teacher"}', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated');

INSERT INTO public.profiles (user_id, role, full_name, avatar_url)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'teacher', 'Maria Garcia', 'https://i.pravatar.cc/150?u=teacher1'),
  ('c0000000-0000-0000-0000-000000000002', 'teacher', 'David Smith', 'https://i.pravatar.cc/150?u=teacher2'),
  ('c0000000-0000-0000-0000-000000000003', 'teacher', 'Elena Rodriguez', 'https://i.pravatar.cc/150?u=teacher3'),
  ('c0000000-0000-0000-0000-000000000004', 'teacher', 'Robert Taylor', 'https://i.pravatar.cc/150?u=teacher4'),
  ('c0000000-0000-0000-0000-000000000005', 'teacher', 'Sophie Martin', 'https://i.pravatar.cc/150?u=teacher5');

INSERT INTO public.teacher_profiles (id, user_id, bio, languages_taught, hourly_rate, years_experience, is_published, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Passionate Spanish teacher with 5 years of experience.', ARRAY['Spanish', 'English'], 25, 5, true, now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'Native English speaker, specializing in business English.', ARRAY['English'], 35, 10, true, now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'Fluent in French and Spanish. Let''s learn together!', ARRAY['French', 'Spanish'], 20, 3, true, now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'Experienced tutor for German and English.', ARRAY['German', 'English'], 30, 7, true, now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'Learn conversational French quickly and easily.', ARRAY['French'], 22, 4, true, now(), now());
