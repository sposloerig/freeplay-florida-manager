/*
  # Update game types for Free Play Florida
  
  1. Changes
    - Update type_check constraint to include Console, Computer, Handheld
    - Remove Skeeball as it's not in the actual form
*/

-- Drop the existing type constraint
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_type_check;

-- Add the new type constraint with Free Play Florida game types
ALTER TABLE games 
ADD CONSTRAINT games_type_check 
CHECK (type IN ('Pinball', 'Arcade', 'Console', 'Computer', 'Handheld', 'Other'));
