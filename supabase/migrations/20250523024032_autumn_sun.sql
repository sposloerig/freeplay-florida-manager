/*
  # Fix RLS policies for games table

  1. Changes
    - Temporarily disable RLS
    - Drop and recreate all policies with unique names
    - Re-enable RLS
    
  2. Security
    - Public users can view games
    - Authenticated users can perform all operations
*/

-- Temporarily disable RLS
ALTER TABLE games DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for public" ON games;
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable insert access for auth users" ON games;
DROP POLICY IF EXISTS "Enable update access for auth users" ON games;
DROP POLICY IF EXISTS "Enable delete access for auth users" ON games;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON games;

-- Create new comprehensive policies with unique names
CREATE POLICY "games_public_read" ON games
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "games_auth_insert" ON games
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "games_auth_update" ON games
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "games_auth_delete" ON games
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Re-enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;