/*
  # Add Short ID for QR Codes
  
  1. Changes
    - Add short_id column to games table (6 character alphanumeric)
    - Create unique index on short_id
    - Create function to generate short IDs
    - Backfill existing games with short IDs
    
  2. Purpose
    - Shorter URLs for QR codes (better scanability)
    - Example: /r/A1B2C3 instead of /report-issue?gameId=uuid
*/

-- Add short_id column
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS short_id text UNIQUE;

-- Create function to generate a random 6-character short ID
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed similar looking chars (0,O,I,1)
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure unique short ID
CREATE OR REPLACE FUNCTION ensure_unique_short_id()
RETURNS text AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    new_id := generate_short_id();
    SELECT EXISTS(SELECT 1 FROM games WHERE short_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate short_id on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_short_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.short_id IS NULL THEN
    NEW.short_id := ensure_unique_short_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_short_id ON games;
CREATE TRIGGER trigger_auto_generate_short_id
  BEFORE INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_short_id();

-- Backfill existing games with short IDs
DO $$
DECLARE
  game_record RECORD;
BEGIN
  FOR game_record IN SELECT id FROM games WHERE short_id IS NULL LOOP
    UPDATE games 
    SET short_id = ensure_unique_short_id() 
    WHERE id = game_record.id;
  END LOOP;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_games_short_id ON games(short_id);

