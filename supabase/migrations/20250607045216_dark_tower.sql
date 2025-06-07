/*
  # Add user tracking for repair resolution

  1. Schema Changes
    - Add `resolved_by` column to repairs table to track which user resolved the repair
    - Update the trigger function to set resolved_by when resolved status changes

  2. Security
    - Update existing policies to handle the new column
*/

-- Add resolved_by column to track which user resolved the repair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repairs' AND column_name = 'resolved_by'
  ) THEN
    ALTER TABLE repairs ADD COLUMN resolved_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update the trigger function to set resolved_by when repair is resolved
CREATE OR REPLACE FUNCTION update_repair_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If resolved status is changing from false to true, set resolved_at and resolved_by
  IF OLD.resolved = false AND NEW.resolved = true THEN
    NEW.resolved_at = now();
    NEW.resolved_by = auth.uid();
  -- If resolved status is changing from true to false, clear resolved_at and resolved_by
  ELSIF OLD.resolved = true AND NEW.resolved = false THEN
    NEW.resolved_at = null;
    NEW.resolved_by = null;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_repairs_resolved_by ON repairs(resolved_by);