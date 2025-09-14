/*
  # Update default value for allow_others_to_service
  
  Change the default value from false to true so that new game submissions
  default to allowing others to service the game if issues arise.
*/

-- Update the default value for new records
ALTER TABLE games ALTER COLUMN allow_others_to_service SET DEFAULT true;

-- Update existing records that are currently false to true (optional)
-- Uncomment the line below if you want to update existing records too:
-- UPDATE games SET allow_others_to_service = true WHERE allow_others_to_service = false;
