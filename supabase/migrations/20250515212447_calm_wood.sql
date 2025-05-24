/*
  # Create test user for employee access

  1. Creates a test employee user account
  2. Sets up initial password (which can be changed later)
  3. Grants necessary access rights
*/

-- Create test employee user
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'employee@replaymuseum.org',
  crypt('replay123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test Employee"}',
  false,
  'authenticated'
);