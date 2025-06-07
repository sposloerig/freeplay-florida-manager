/*
  # Rebuild Game Repair System

  1. Drop existing repair-related tables and recreate with simple structure
  2. New simplified repairs table with just:
     - Game reference
     - Comment/description
     - Basic metadata (created_at, updated_at)
  3. Remove complex fields like status, priority, parts, etc.
  4. Keep it simple for easy maintenance
*/

-- Drop existing repair-related tables
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS repairs CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- Create simple repairs table
CREATE TABLE repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Create policies for repairs
CREATE POLICY "Anyone can view repairs"
  ON repairs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can modify repairs"
  ON repairs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_repairs_updated_at
  BEFORE UPDATE ON repairs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_repairs_game_id ON repairs(game_id);
CREATE INDEX idx_repairs_created_at ON repairs(created_at DESC);