/*
  # Fix RLS policies for games table

  1. Changes
    - Drop existing RLS policies for games table
    - Create new comprehensive RLS policies that properly handle all operations
    
  2. Security
    - Enable RLS on games table (already enabled)
    - Add policies for all CRUD operations
    - Ensure authenticated users can perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view games" ON games;
DROP POLICY IF EXISTS "Authenticated users can modify games" ON games;

-- Create new comprehensive policies
CREATE POLICY "Enable read access for authenticated users" ON games
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON games
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON games
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON games
  FOR DELETE 
  TO authenticated 
  USING (true);