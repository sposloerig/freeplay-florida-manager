-- Add zone field to games table for event placement
ALTER TABLE games ADD COLUMN zone VARCHAR(20);

-- Add index for zone queries
CREATE INDEX idx_games_zone ON games(zone);

-- Update existing games to have no zone assigned initially
UPDATE games SET zone = NULL WHERE zone IS NULL;
