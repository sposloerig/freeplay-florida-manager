/*
  # Create chatbot settings table

  1. New Tables
    - `chatbot_settings`: Store chatbot configuration
      - `id` (uuid, primary key)
      - `enabled` (boolean) - Whether chatbot is active
      - `agent_id` (text) - ElevenLabs agent ID
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on chatbot_settings table
    - Public can view settings (for frontend to check if enabled)
    - Only managers can modify settings

  3. Functions
    - Create update_updated_at_column function if it doesn't exist
*/

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create chatbot_settings table
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT true,
  agent_id text DEFAULT 'agent_01jx426hnyex4r29vgjrby9h3b',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view chatbot settings" ON chatbot_settings;
DROP POLICY IF EXISTS "Managers can modify chatbot settings" ON chatbot_settings;

-- Create policies
CREATE POLICY "Public can view chatbot settings"
  ON chatbot_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Managers can modify chatbot settings"
  ON chatbot_settings
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN (
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    )
  )
  WITH CHECK (
    auth.email() IN (
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    )
  );

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_chatbot_settings_updated_at ON chatbot_settings;

-- Add updated_at trigger
CREATE TRIGGER update_chatbot_settings_updated_at
  BEFORE UPDATE ON chatbot_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if none exist
INSERT INTO chatbot_settings (enabled, agent_id) 
SELECT true, 'agent_01jx426hnyex4r29vgjrby9h3b'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_settings);