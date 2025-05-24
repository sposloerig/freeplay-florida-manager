/*
  # Add manager user accounts

  1. Creates manager accounts for:
    - Amy (amy@straylite.com)
    - Fred (fred@replaymuseum.com)
  2. Sets up initial passwords (which should be changed on first login)
  3. Grants necessary access rights
*/

-- Create manager users
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
VALUES
-- Amy's account
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'amy@straylite.com',
  crypt('replay123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Amy"}',
  false,
  'authenticated'
),
-- Fred's account
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'fred@replaymuseum.com',
  crypt('replay123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Fred"}',
  false,
  'authenticated'
);