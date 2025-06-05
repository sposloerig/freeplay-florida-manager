/*
  # Add thumbnail support to games table
  
  1. Changes
    - Add thumbnail_url column to games table
    - Add function to generate thumbnail URL from image_url
    - Update existing records to populate thumbnail_url
*/

-- Add thumbnail_url column
ALTER TABLE games ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Create function to generate thumbnail URL
CREATE OR REPLACE FUNCTION generate_thumbnail_url(image_url text)
RETURNS text AS $$
BEGIN
    -- For Pexels images, append ?auto=compress&cs=tinysrgb&w=200 to create thumbnails
    IF image_url LIKE 'https://images.pexels.com/%' THEN
        RETURN image_url || '?auto=compress&cs=tinysrgb&w=200';
    END IF;
    RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- Update existing records to populate thumbnail_url
UPDATE games 
SET thumbnail_url = generate_thumbnail_url(image_url)
WHERE image_url IS NOT NULL AND thumbnail_url IS NULL;