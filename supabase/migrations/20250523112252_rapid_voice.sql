/*
  # Add play@replaymuseum.com user account

  1. Changes
    - Add new user account for play@replaymuseum.com
    - Set initial password
    - Configure as authenticated user
*/

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
  'play@replaymuseum.com',
  crypt('replay123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Play Account"}',
  false,
  'authenticated'
);