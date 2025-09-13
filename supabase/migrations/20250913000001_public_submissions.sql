/*
  # Add public submission system fields
  
  1. New Columns for Games Table
    - Approval workflow fields
    - Comprehensive owner information
    - Service preferences
    - Enhanced sales information
    
  2. Security Updates
    - Allow public to insert games (with submitted status)
    - Only admins can approve/reject games
*/

-- Add approval workflow columns
DO $$
BEGIN
  -- Approval status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE games ADD COLUMN approval_status text DEFAULT 'submitted';
    ALTER TABLE games ADD CONSTRAINT games_approval_status_check 
    CHECK (approval_status IN ('submitted', 'approved', 'rejected'));
  END IF;

  -- Submission tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE games ADD COLUMN submitted_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE games ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE games ADD COLUMN approved_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE games ADD COLUMN rejection_reason text;
  END IF;

  -- Owner information (make required)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'owner_name'
  ) THEN
    ALTER TABLE games ADD COLUMN owner_name text NOT NULL DEFAULT 'Unknown';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'owner_email'
  ) THEN
    ALTER TABLE games ADD COLUMN owner_email text NOT NULL DEFAULT 'unknown@example.com';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'owner_phone'
  ) THEN
    ALTER TABLE games ADD COLUMN owner_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'owner_address'
  ) THEN
    ALTER TABLE games ADD COLUMN owner_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'owner_notes'
  ) THEN
    ALTER TABLE games ADD COLUMN owner_notes text;
  END IF;

  -- Service preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'allow_others_to_service'
  ) THEN
    ALTER TABLE games ADD COLUMN allow_others_to_service boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'service_notes'
  ) THEN
    ALTER TABLE games ADD COLUMN service_notes text;
  END IF;

  -- Enhanced sales information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'accept_offers'
  ) THEN
    ALTER TABLE games ADD COLUMN accept_offers boolean DEFAULT false;
  END IF;

  -- Update for_sale to be NOT NULL with default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'for_sale' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE games ALTER COLUMN for_sale SET DEFAULT false;
    UPDATE games SET for_sale = false WHERE for_sale IS NULL;
    ALTER TABLE games ALTER COLUMN for_sale SET NOT NULL;
  END IF;
END $$;

-- Update RLS policies for public submissions

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view games" ON games;
DROP POLICY IF EXISTS "Authenticated users can modify games" ON games;

-- Allow public to view approved games
CREATE POLICY "Public can view approved games"
  ON games FOR SELECT
  TO anon, authenticated
  USING (approval_status = 'approved');

-- Allow public to submit games
CREATE POLICY "Public can submit games"
  ON games FOR INSERT
  TO anon, authenticated
  WITH CHECK (approval_status = 'submitted');

-- Allow authenticated users to view all games (for admin)
CREATE POLICY "Authenticated users can view all games"
  ON games FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update games (for admin approval/management)
CREATE POLICY "Authenticated users can modify games"
  ON games FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete games
CREATE POLICY "Authenticated users can delete games"
  ON games FOR DELETE
  TO authenticated
  USING (true);
