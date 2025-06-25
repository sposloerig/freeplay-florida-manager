/*
  # Update games for_sale default to false

  1. Changes
    - Set all existing games to for_sale = false
    - Update the default value for for_sale column to false
    - This ensures no games appear for sale unless explicitly marked

  2. Impact
    - All current games will be unmarked for sale
    - New games added will default to not for sale
    - Admin must explicitly mark games for sale
*/

-- Update all existing games to not be for sale
UPDATE games SET for_sale = false WHERE for_sale = true OR for_sale IS NULL;

-- Update the default value for the for_sale column to false
ALTER TABLE games ALTER COLUMN for_sale SET DEFAULT false;

-- Ensure the column is not nullable and has the correct default
ALTER TABLE games ALTER COLUMN for_sale SET NOT NULL;