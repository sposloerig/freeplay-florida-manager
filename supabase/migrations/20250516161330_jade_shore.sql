/*
  # Update repairs table with better date handling

  1. Changes
    - Add repair_start_date for when repair work begins
    - Add repair_completion_date for when repair is finished
    - Add estimated_completion_date for planning
    - Add priority field for repair urgency

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS repair_start_date timestamptz,
ADD COLUMN IF NOT EXISTS repair_completion_date timestamptz,
ADD COLUMN IF NOT EXISTS estimated_completion_date timestamptz,
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));

-- Update the status check constraint to be more specific
ALTER TABLE repairs 
DROP CONSTRAINT IF EXISTS repairs_status_check;

ALTER TABLE repairs
ADD CONSTRAINT repairs_status_check 
CHECK (status IN ('Open', 'In Progress', 'Completed', 'On Hold', 'Waiting for Parts'));

-- Add trigger to automatically set repair dates based on status changes
CREATE OR REPLACE FUNCTION update_repair_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'In Progress' AND OLD.status != 'In Progress' THEN
    NEW.repair_start_date = CURRENT_TIMESTAMP;
  ELSIF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    NEW.repair_completion_date = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_repair_dates ON repairs;
CREATE TRIGGER set_repair_dates
  BEFORE UPDATE ON repairs
  FOR EACH ROW
  EXECUTE FUNCTION update_repair_dates();