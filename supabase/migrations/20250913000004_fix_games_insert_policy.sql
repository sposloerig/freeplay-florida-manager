-- Fix RLS policies to allow anonymous users to submit games
-- Drop existing restrictive policies and create new ones for public submissions

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view approved games" ON games;
DROP POLICY IF EXISTS "Managers can view all games" ON games;
DROP POLICY IF EXISTS "Managers can insert games" ON games;
DROP POLICY IF EXISTS "Managers can update games" ON games;
DROP POLICY IF EXISTS "Managers can delete games" ON games;

-- Allow anyone (including anonymous users) to view approved games
CREATE POLICY "Anyone can view approved games" ON games
  FOR SELECT USING (approval_status = 'approved');

-- Allow anyone (including anonymous users) to submit games for approval
CREATE POLICY "Anyone can submit games for approval" ON games
  FOR INSERT WITH CHECK (approval_status = 'pending');

-- Only authenticated managers can view all games (including pending)
CREATE POLICY "Managers can view all games" ON games
  FOR SELECT USING (
    auth.email() IN (
      'admin@freeplayflorida.com'
    )
  );

-- Only authenticated managers can update games
CREATE POLICY "Managers can update games" ON games
  FOR UPDATE USING (
    auth.email() IN (
      'admin@freeplayflorida.com'
    )
  );

-- Only authenticated managers can delete games
CREATE POLICY "Managers can delete games" ON games
  FOR DELETE USING (
    auth.email() IN (
      'admin@freeplayflorida.com'
    )
  );
