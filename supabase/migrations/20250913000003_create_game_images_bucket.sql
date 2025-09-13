-- Create storage bucket for game images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-images',
  'game-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Set up RLS policies for the game-images bucket
CREATE POLICY "Anyone can view game images" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-images');

CREATE POLICY "Anyone can upload game images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'game-images');

CREATE POLICY "Users can update their own game images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'game-images');

CREATE POLICY "Users can delete their own game images" ON storage.objects
  FOR DELETE USING (bucket_id = 'game-images');
