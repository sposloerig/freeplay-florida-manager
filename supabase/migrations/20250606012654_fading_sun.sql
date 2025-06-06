/*
  # Update admin policies to include all managers

  1. Changes
    - Updates all admin-related policies to include all manager emails
    - Ensures consistent access across all features
    - Affects business_hours, special_hours, announcements tables

  2. Security
    - Maintains existing RLS policies
    - Updates policy conditions to include all manager emails
    - Preserves existing access patterns
*/

-- Update business hours policies
DROP POLICY IF EXISTS "Managers can modify business hours" ON business_hours;
CREATE POLICY "Managers can modify business hours"
ON business_hours
FOR ALL
TO authenticated
USING (
  email() = ANY (ARRAY[
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  ])
)
WITH CHECK (
  email() = ANY (ARRAY[
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
  email() = ANY (ARRAY[
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  ])
)
WITH CHECK (
  email() = ANY (ARRAY[
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
  email() = ANY (ARRAY[
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  ])
)
WITH CHECK (
  email() = ANY (ARRAY[
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com',
    'brian@replaymuseum.com'
  ])
);