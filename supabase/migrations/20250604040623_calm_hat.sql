/*
  # Fix Business Hours RLS Policy

  1. Changes
    - Update RLS policy for business_hours table to use auth.jwt() instead of email()
    - Fix manager access check to use proper email verification

  2. Security
    - Maintains RLS enabled on business_hours table
    - Updates policy to properly check manager emails
    - Keeps public read access unchanged
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Managers can modify business hours" ON business_hours;

-- Create new policy with fixed email check
CREATE POLICY "Managers can modify business hours"
ON business_hours
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email')::text = ANY (
    ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com'
    ]
  )
)
WITH CHECK (
  (auth.jwt() ->> 'email')::text = ANY (
    ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com'
    ]
  )
);