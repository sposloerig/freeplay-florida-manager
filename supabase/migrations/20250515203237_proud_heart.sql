/*
  # Create storage buckets for game and repair images

  1. New Storage Buckets
    - `game-images`: For storing game-related images
    - `repair-images`: For storing repair documentation images

  2. Security
    - Enable public access for viewing images
    - Allow authenticated users to upload images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('game-images', 'game-images', true),
  ('repair-images', 'repair-images', true);

-- Set up security policies for game-images bucket
CREATE POLICY "Anyone can view game images"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Authenticated users can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-images'
  AND auth.role() = 'authenticated'
);

-- Set up security policies for repair-images bucket
CREATE POLICY "Anyone can view repair images"
ON storage.objects FOR SELECT
USING (bucket_id = 'repair-images');

CREATE POLICY "Authenticated users can upload repair images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'repair-images'
  AND auth.role() = 'authenticated'
);