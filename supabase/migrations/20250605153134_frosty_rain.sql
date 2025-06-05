-- Update the thumbnail generation function to handle more image types
CREATE OR REPLACE FUNCTION generate_thumbnail_url(image_url text)
RETURNS text AS $$
BEGIN
    -- Handle different image hosting services
    IF image_url LIKE 'https://images.pexels.com/%' THEN
        RETURN image_url || '?auto=compress&cs=tinysrgb&w=200';
    ELSIF image_url LIKE 'https://images.unsplash.com/%' THEN
        -- Unsplash already has URL parameters, append thumbnail params
        IF image_url LIKE '%?%' THEN
            RETURN image_url || '&w=200&q=80';
        ELSE
            RETURN image_url || '?w=200&q=80';
        END IF;
    END IF;
    RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- Update all games to have thumbnails
UPDATE games 
SET thumbnail_url = generate_thumbnail_url(image_url)
WHERE image_url IS NOT NULL;

-- Update games table to ensure thumbnail_url is updated when image_url changes
CREATE OR REPLACE FUNCTION update_thumbnail_url()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.image_url IS NOT NULL THEN
        NEW.thumbnail_url = generate_thumbnail_url(NEW.image_url);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for thumbnail updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_thumbnail_url_trigger'
    ) THEN
        CREATE TRIGGER update_thumbnail_url_trigger
            BEFORE INSERT OR UPDATE OF image_url ON games
            FOR EACH ROW
            EXECUTE FUNCTION update_thumbnail_url();
    END IF;
END $$;