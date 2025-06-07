/*
  # Add resolved functionality to repairs

  1. Schema Changes
    - Add `resolved` boolean column to repairs table (defaults to false)
    - Add `resolved_at` timestamp column for when repair was resolved
    - Add index for better performance on resolved status

  2. Security
    - Maintain existing RLS policies
    - Only authenticated users can view and modify repairs
*/

-- Add resolved columns to repairs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repairs' AND column_name = 'resolved'
  ) THEN
    ALTER TABLE repairs ADD COLUMN resolved boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repairs' AND column_name = 'resolved_at'
  ) THEN
    ALTER TABLE repairs ADD COLUMN resolved_at timestamptz;
  END IF;
END $$;

-- Create index for resolved status
CREATE INDEX IF NOT EXISTS idx_repairs_resolved ON repairs(resolved);

-- Update the trigger to handle resolved_at timestamp
CREATE OR REPLACE FUNCTION update_repair_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If resolved status changed from false to true, set resolved_at
  IF OLD.resolved = false AND NEW.resolved = true THEN
    NEW.resolved_at = now();
  -- If resolved status changed from true to false, clear resolved_at
  ELSIF OLD.resolved = true AND NEW.resolved = false THEN
    NEW.resolved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for resolved_at updates
DROP TRIGGER IF EXISTS update_repair_resolved_at_trigger ON repairs;
CREATE TRIGGER update_repair_resolved_at_trigger
  BEFORE UPDATE ON repairs
  FOR EACH ROW
  EXECUTE FUNCTION update_repair_resolved_at();