/*
  # Update location constraints for festival use
  
  1. Changes
    - Update location_check constraint to use festival-appropriate locations
    - Change from museum locations (Replay, Warehouse) to festival areas
*/

-- Drop the existing location constraint
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_location_check;

-- Add the new location constraint with festival areas
ALTER TABLE games 
ADD CONSTRAINT games_location_check 
CHECK (location IN ('Main Hall', 'Side Room', 'Outdoor Area', 'Other'));
