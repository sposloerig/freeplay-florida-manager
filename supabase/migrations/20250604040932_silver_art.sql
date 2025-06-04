/*
  # Update business hours RLS policy

  1. Changes
    - Drop existing RLS policies for business_hours table
    - Create new comprehensive RLS policy for business hours management
    
  2. Security
    - Enable RLS on business_hours table
    - Add policy for public read access
    - Add policy for manager write access using email() function
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Managers can modify business hours" ON business_hours;
DROP POLICY IF EXISTS "Public can view business hours" ON business_hours;

-- Create new policies
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