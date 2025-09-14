-- Temporarily disable RLS to allow anonymous submissions
-- We'll re-enable with proper policies once working

-- Disable RLS on games table temporarily
ALTER TABLE games DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create a very permissive insert policy
-- Uncomment these lines if you prefer to keep RLS enabled:

-- DROP POLICY IF EXISTS "Anyone can submit games for approval" ON games;
-- CREATE POLICY "Allow all game submissions" ON games
--   FOR INSERT WITH CHECK (true);

-- Also ensure the storage bucket exists and has proper policies
DO $$
BEGIN
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'game-images',
    'game-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies for game images
DROP POLICY IF EXISTS "Anyone can view game images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload game images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own game images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own game images" ON storage.objects;

CREATE POLICY "Anyone can view game images" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-images');

CREATE POLICY "Anyone can upload game images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'game-images');

CREATE POLICY "Anyone can update game images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'game-images');

CREATE POLICY "Anyone can delete game images" ON storage.objects
  FOR DELETE USING (bucket_id = 'game-images');
