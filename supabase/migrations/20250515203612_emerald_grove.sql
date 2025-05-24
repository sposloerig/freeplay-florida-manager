/*
  # Create core tables and policies

  1. New Tables
    - `games`: Stores game information including type, location, and status
    - `repairs`: Tracks repair requests and their status
    - `parts`: Manages parts needed for repairs
    - `vendors`: Stores vendor information for parts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and modify data
*/

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  type_other text,
  location text NOT NULL,
  location_other text,
  status text NOT NULL,
  condition_notes text,
  last_shopped timestamptz,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT games_type_check CHECK (type IN ('Pinball', 'Arcade', 'Other')),
  CONSTRAINT games_location_check CHECK (location IN ('Replay', 'Warehouse', 'Other')),
  CONSTRAINT games_status_check CHECK (status IN ('Operational', 'In Repair', 'Awaiting Parts'))
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view games
DROP POLICY IF EXISTS "Anyone can view games" ON games;
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to modify games
DROP POLICY IF EXISTS "Authenticated users can modify games" ON games;
CREATE POLICY "Authenticated users can modify games"
  ON games FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  request_description text NOT NULL,
  repair_notes text,
  logged_by uuid NOT NULL,
  status text NOT NULL,
  repair_date timestamptz,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT repairs_status_check CHECK (status IN ('Open', 'In Progress', 'Completed'))
);

ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view repairs
DROP POLICY IF EXISTS "Anyone can view repairs" ON repairs;
CREATE POLICY "Anyone can view repairs"
  ON repairs FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to modify repairs
DROP POLICY IF EXISTS "Authenticated users can modify repairs" ON repairs;
CREATE POLICY "Authenticated users can modify repairs"
  ON repairs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id uuid REFERENCES repairs(id) ON DELETE CASCADE,
  name text NOT NULL,
  estimated_cost numeric(10,2) DEFAULT 0 NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT parts_status_check CHECK (status IN ('Needed', 'Ordered', 'Received', 'Installed'))
);

ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view parts
DROP POLICY IF EXISTS "Anyone can view parts" ON parts;
CREATE POLICY "Anyone can view parts"
  ON parts FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to modify parts
DROP POLICY IF EXISTS "Authenticated users can modify parts" ON parts;
CREATE POLICY "Authenticated users can modify parts"
  ON parts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view vendors
DROP POLICY IF EXISTS "Anyone can view vendors" ON vendors;
CREATE POLICY "Anyone can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to modify vendors
DROP POLICY IF EXISTS "Authenticated users can modify vendors" ON vendors;
CREATE POLICY "Authenticated users can modify vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);