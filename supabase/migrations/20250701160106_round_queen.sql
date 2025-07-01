/*
  # Add users table for better user management

  1. New Tables
    - `users`: Store user information
      - `id` (uuid, primary key) - References auth.users(id)
      - `email` (text, unique) - User's email address
      - `display_name` (text) - User's display name
      - `role` (text) - User's role (admin, manager, staff)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Public can view basic user info
    - Only authenticated users can modify their own data
    - Managers can modify all user data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  role text DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view user info"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Managers can modify all user data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.email() = ANY (ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    ])
  )
  WITH CHECK (
    auth.email() = ANY (ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    ])
  );

-- Add updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert existing users into the users table
INSERT INTO public.users (id, email, display_name, role)
SELECT 
  id, 
  email, 
  SPLIT_PART(email, '@', 1),
  CASE 
    WHEN email IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com') THEN 'manager'
    ELSE 'staff'
  END
FROM auth.users
ON CONFLICT (id) DO NOTHING;