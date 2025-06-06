/*
  # Update Manager Access Policies

  1. Changes
    - Fix email function calls to use auth.email()
    - Update policies for business_hours, special_hours, and announcements tables
    - Ensure consistent access for all manager emails

  2. Security
    - Maintain RLS policies for manager-only access
    - Use proper auth.email() function for checking user permissions
*/

-- Update business hours policies
DROP POLICY IF EXISTS "Managers can modify business hours" ON business_hours;
CREATE POLICY "Managers can modify business hours"
ON business_hours
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

-- Update special hours policies
DROP POLICY IF EXISTS "Managers can modify special hours" ON special_hours;
CREATE POLICY "Managers can modify special hours"
ON special_hours
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

-- Update announcements policies
DROP POLICY IF EXISTS "Managers can modify announcements" ON announcements;
CREATE POLICY "Managers can modify announcements"
ON announcements
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