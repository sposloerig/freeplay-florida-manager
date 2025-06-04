/*
  # Update announcements table RLS policies

  1. Changes
    - Drop existing RLS policies for announcements table
    - Create new policies that properly handle all operations based on manager emails
    
  2. Security
    - Enable RLS on announcements table
    - Add policies for:
      - INSERT: Only managers can add announcements
      - SELECT: Public can view active announcements
      - UPDATE/DELETE: Only managers can modify announcements
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view announcements" ON announcements;
DROP POLICY IF EXISTS "Managers can modify announcements" ON announcements;

-- Create new policies
CREATE POLICY "Public can view announcements"
ON announcements
FOR SELECT
TO public
USING (true);

CREATE POLICY "Managers can insert announcements"
ON announcements
FOR INSERT
TO authenticated
WITH CHECK (
  auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  )
);

CREATE POLICY "Managers can update announcements"
ON announcements
FOR UPDATE
TO authenticated
USING (
  auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  )
)
WITH CHECK (
  auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  )
);

CREATE POLICY "Managers can delete announcements"
ON announcements
FOR DELETE
TO authenticated
USING (
  auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  )
);