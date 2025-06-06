/*
  # Fix business hours RLS policies

  The issue is that the RLS policies are using `email()` function which may not work correctly
  in all contexts. We need to use `auth.email()` consistently and ensure the policies
  are properly structured.

  1. Update business hours policies to use proper auth functions
  2. Update special hours policies to use proper auth functions  
  3. Update announcements policies to use proper auth functions
  4. Ensure policies don't interfere with data persistence
*/

-- Drop and recreate business_hours policies with correct auth function
DROP POLICY IF EXISTS "Managers can modify business hours" ON business_hours;
DROP POLICY IF EXISTS "Public can view business hours" ON business_hours;

CREATE POLICY "Public can view business hours"
ON business_hours
FOR SELECT
TO public
USING (true);

CREATE POLICY "Managers can modify business hours"
ON business_hours
FOR ALL
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

-- Drop and recreate special_hours policies with correct auth function
DROP POLICY IF EXISTS "Managers can modify special hours" ON special_hours;
DROP POLICY IF EXISTS "Public can view special hours" ON special_hours;

CREATE POLICY "Public can view special hours"
ON special_hours
FOR SELECT
TO public
USING (true);

CREATE POLICY "Managers can modify special hours"
ON special_hours
FOR ALL
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

-- Drop and recreate announcements policies with correct auth function
DROP POLICY IF EXISTS "Managers can modify announcements" ON announcements;
DROP POLICY IF EXISTS "Managers can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Managers can update announcements" ON announcements;
DROP POLICY IF EXISTS "Managers can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Public can view announcements" ON announcements;

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