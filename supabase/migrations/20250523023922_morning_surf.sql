/*
  # Fix RLS policies for games table

  1. Changes
    - Drop ALL existing RLS policies for games table
    - Create new comprehensive RLS policies that properly handle all operations
    
  2. Security
    - Enable RLS on games table (already enabled)
    - Add policies for all CRUD operations
    - Ensure public users can view games
    - Ensure authenticated users can perform all operations
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON games;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON games;

-- Create new comprehensive policies
CREATE POLICY "Enable read access for public" ON games
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Enable insert access for auth users" ON games
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update access for auth users" ON games
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for auth users" ON games
  FOR DELETE 
  TO authenticated 
  USING (true);