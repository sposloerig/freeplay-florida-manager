/*
  # Update sales system defaults
  
  1. Changes
    - Set all existing games to for_sale = true by default
    - Update default value for new games to be for_sale = true
*/

-- Set all existing games to be for sale by default
UPDATE games SET for_sale = true WHERE for_sale IS NULL OR for_sale = false;

-- Update the default value for the for_sale column
ALTER TABLE games ALTER COLUMN for_sale SET DEFAULT true;