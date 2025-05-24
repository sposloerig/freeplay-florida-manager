/*
  # Create repair tracking tables

  1. New Tables
    - `vendors`: Store vendor information for parts
    - `repairs`: Track repair history for games
    - `parts`: Track parts needed for repairs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Anyone can view vendors'
  ) THEN
    CREATE POLICY "Anyone can view vendors"
      ON vendors
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Authenticated users can modify vendors'
  ) THEN
    CREATE POLICY "Authenticated users can modify vendors"
      ON vendors
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create repairs table if it doesn't exist
CREATE TABLE IF NOT EXISTS repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  request_description text NOT NULL,
  repair_notes text,
  logged_by uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('Open', 'In Progress', 'Completed')),
  repair_date timestamptz,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies for repairs
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'repairs' AND policyname = 'Anyone can view repairs'
  ) THEN
    CREATE POLICY "Anyone can view repairs"
      ON repairs
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'repairs' AND policyname = 'Authenticated users can modify repairs'
  ) THEN
    CREATE POLICY "Authenticated users can modify repairs"
      ON repairs
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create parts table if it doesn't exist
CREATE TABLE IF NOT EXISTS parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id uuid REFERENCES repairs(id) ON DELETE CASCADE,
  name text NOT NULL,
  estimated_cost numeric(10,2) DEFAULT 0 NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('Needed', 'Ordered', 'Received', 'Installed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies for parts
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parts' AND policyname = 'Anyone can view parts'
  ) THEN
    CREATE POLICY "Anyone can view parts"
      ON parts
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parts' AND policyname = 'Authenticated users can modify parts'
  ) THEN
    CREATE POLICY "Authenticated users can modify parts"
      ON parts
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;