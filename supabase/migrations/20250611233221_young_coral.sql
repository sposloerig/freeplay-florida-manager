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
*/

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
    auth.email() = ANY (ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    ])
  )
  WITH CHECK (
    auth.email() = ANY (ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    ])
  );

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
CREATE TRIGGER update_chatbot_settings_updated_at
  BEFORE UPDATE ON chatbot_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO chatbot_settings (enabled, agent_id) 
VALUES (true, 'agent_01jx426hnyex4r29vgjrby9h3b')
ON CONFLICT DO NOTHING;