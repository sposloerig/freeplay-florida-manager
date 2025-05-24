/*
  # Add gift cards table

  1. New Tables
    - `gift_cards`
      - `id` (uuid, primary key)
      - `denomination` (numeric(10,2), not null) - The monetary value of the gift card
      - `description` (text, not null) - Description or notes about the gift card
      - `active` (boolean, default true) - Whether the gift card type is currently active
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `gift_cards` table
    - Add policies for:
      - Public can view active gift cards
      - Authenticated users can manage gift cards
*/

-- Create gift cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  denomination numeric(10,2) NOT NULL,
  description text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users can view active gift cards"
  ON gift_cards
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Authenticated users can manage gift cards"
  ON gift_cards
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();