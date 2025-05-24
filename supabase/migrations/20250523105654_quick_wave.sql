/*
  # Add condition notes column to games table

  1. Changes
    - Add condition_notes column to games table for storing detailed game condition information
*/

-- Add condition_notes column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'condition_notes'
  ) THEN
    ALTER TABLE games ADD COLUMN condition_notes text;
  END IF;
END $$;