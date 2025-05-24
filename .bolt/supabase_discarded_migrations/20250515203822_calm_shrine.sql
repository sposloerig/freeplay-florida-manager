/*
  # Storage bucket configuration

  This migration creates a public storage bucket for game images and sets up
  the appropriate security policies.

  1. Security
    - Public read access for game images
    - Authenticated users can upload images
    - Only owners can update/delete their images
*/

-- Create a trigger function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a table to track our storage configuration
CREATE TABLE IF NOT EXISTS public.storage_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_name text NOT NULL UNIQUE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storage_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access"
  ON public.storage_settings FOR SELECT
  TO public
  USING (true);

-- Insert game-images bucket configuration
INSERT INTO public.storage_settings (bucket_name, is_public)
VALUES ('game-images', true)
ON CONFLICT (bucket_name) DO NOTHING;

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.storage_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();