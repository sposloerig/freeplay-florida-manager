/*
  # Add all_images column to games table

  1. New Columns
    - `all_images` (text[]) - Array of image URLs for multiple images per game
    
  2. Changes
    - Add all_images column to store multiple images per game
    - Update thumbnail generation function to handle the first image in the array
*/

-- Add all_images column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS all_images text[];

-- Update the thumbnail generation function to handle all_images
CREATE OR REPLACE FUNCTION update_thumbnail_url()
RETURNS TRIGGER AS $$
BEGIN
    -- If image_url is set, generate thumbnail from it
    IF NEW.image_url IS NOT NULL THEN
        NEW.thumbnail_url = NEW.image_url;
        
        -- For Pexels images, append parameters for thumbnails
        IF NEW.image_url LIKE 'https://images.pexels.com/%' THEN
            NEW.thumbnail_url = NEW.image_url || '?auto=compress&cs=tinysrgb&w=200';
        -- For Unsplash images
        ELSIF NEW.image_url LIKE 'https://images.unsplash.com/%' THEN
            -- Unsplash already has URL parameters, append thumbnail params
            IF NEW.image_url LIKE '%?%' THEN
                NEW.thumbnail_url = NEW.image_url || '&w=200&q=80';
            ELSE
                NEW.thumbnail_url = NEW.image_url || '?w=200&q=80';
            END IF;
        END IF;
    -- If all_images has entries but image_url is null, use the first image
    ELSIF NEW.all_images IS NOT NULL AND array_length(NEW.all_images, 1) > 0 THEN
        NEW.image_url = NEW.all_images[1];
        NEW.thumbnail_url = NEW.all_images[1];
        
        -- Apply thumbnail transformations
        IF NEW.image_url LIKE 'https://images.pexels.com/%' THEN
            NEW.thumbnail_url = NEW.image_url || '?auto=compress&cs=tinysrgb&w=200';
        ELSIF NEW.image_url LIKE 'https://images.unsplash.com/%' THEN
            IF NEW.image_url LIKE '%?%' THEN
                NEW.thumbnail_url = NEW.image_url || '&w=200&q=80';
            ELSE
                NEW.thumbnail_url = NEW.image_url || '?w=200&q=80';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS update_thumbnail_url_trigger ON games;
CREATE TRIGGER update_thumbnail_url_trigger
    BEFORE INSERT OR UPDATE OF image_url, all_images ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_thumbnail_url();