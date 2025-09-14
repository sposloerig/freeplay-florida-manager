-- Add display_contact_publicly field to games table
ALTER TABLE games ADD COLUMN display_contact_publicly BOOLEAN DEFAULT FALSE;

-- Update existing games to have display_contact_publicly = false by default
UPDATE games SET display_contact_publicly = FALSE WHERE display_contact_publicly IS NULL;
