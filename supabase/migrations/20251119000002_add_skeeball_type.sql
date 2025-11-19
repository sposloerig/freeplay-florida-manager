/*
  # Add Skeeball back to game types
  
  1. Changes
    - Update type_check constraint to include Skeeball
    - Allows existing Skeeball game to remain valid
*/

-- Drop the existing type constraint
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_type_check;

-- Add the new type constraint with Skeeball included
ALTER TABLE games 
ADD CONSTRAINT games_type_check 
CHECK (type IN ('Pinball', 'Arcade', 'Console', 'Computer', 'Handheld', 'Skeeball', 'Other'));

