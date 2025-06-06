/*
  # Add sales fields to games table

  1. New Columns
    - `asking_price` (numeric) - The asking price for the game
    - `for_sale` (boolean) - Whether the game is available for sale
    - `sale_condition_notes` (text) - Detailed condition notes for potential buyers
    - `missing_parts` (text[]) - Array of missing parts/components
    - `sale_notes` (text) - Additional notes for buyers

  2. Security
    - Only authenticated users can view sales fields
    - Only managers can modify sales fields
*/

-- Add sales-related columns to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'asking_price'
  ) THEN
    ALTER TABLE games ADD COLUMN asking_price numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'for_sale'
  ) THEN
    ALTER TABLE games ADD COLUMN for_sale boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'sale_condition_notes'
  ) THEN
    ALTER TABLE games ADD COLUMN sale_condition_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'missing_parts'
  ) THEN
    ALTER TABLE games ADD COLUMN missing_parts text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'sale_notes'
  ) THEN
    ALTER TABLE games ADD COLUMN sale_notes text;
  END IF;
END $$;

-- Create buyer inquiries table
CREATE TABLE IF NOT EXISTS buyer_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  offer_amount numeric(10,2),
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on buyer_inquiries
ALTER TABLE buyer_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for buyer_inquiries
CREATE POLICY "Anyone can submit buyer inquiries"
  ON buyer_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Managers can view all buyer inquiries"
  ON buyer_inquiries
  FOR SELECT
  TO authenticated
  USING (
    auth.email() = ANY (ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    ])
  );

CREATE POLICY "Managers can update buyer inquiries"
  ON buyer_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    auth.email() = ANY (ARRAY[
      'amy@straylite.com',
      'fred@replaymuseum.com',
      'play@replaymuseum.com',
      'brian@replaymuseum.com'
    ])
  );

-- Create updated_at trigger for buyer_inquiries
CREATE TRIGGER update_buyer_inquiries_updated_at
  BEFORE UPDATE ON buyer_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();