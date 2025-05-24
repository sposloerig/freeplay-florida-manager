/*
  # Fix games type constraint

  1. Changes
    - Update type_check constraint to handle additional game types
    - Add 'Skeeball' as a valid game type
*/

-- Temporarily drop the type constraint
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_type_check;

-- Add the new type constraint with additional types
ALTER TABLE games 
ADD CONSTRAINT games_type_check 
CHECK (type IN ('Pinball', 'Arcade', 'Other', 'Skeeball'));