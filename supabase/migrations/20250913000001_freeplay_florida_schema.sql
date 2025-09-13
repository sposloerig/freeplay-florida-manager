/*
  # Free Play Florida - Complete Database Schema
  
  This migration sets up the complete database schema for Free Play Florida,
  including public game submissions, approval workflow, and marketplace features.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table with public submission support
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  type_other text,
  location text,
  location_other text,
  status text NOT NULL DEFAULT 'Operational',
  condition_notes text,
  high_score integer,
  year_made integer,
  images text[] DEFAULT '{}',
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Approval workflow
  approval_status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by text,
  rejection_reason text,
  
  -- Owner information (required)
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text,
  owner_address text,
  owner_notes text,
  
  -- Service preferences
  allow_others_to_service boolean DEFAULT false,
  service_notes text,
  
  -- Sales information
  for_sale boolean DEFAULT false,
  asking_price numeric(10,2),
  accept_offers boolean DEFAULT false,
  sale_condition_notes text,
  missing_parts text[],
  sale_notes text,
  
  CONSTRAINT games_type_check CHECK (type IN ('Pinball', 'Arcade', 'Other', 'Skeeball')),
  CONSTRAINT games_location_check CHECK (location IN ('Main Hall', 'Side Room', 'Outdoor Area', 'Other') OR location IS NULL),
  CONSTRAINT games_status_check CHECK (status IN ('Operational', 'In Repair', 'Awaiting Parts')),
  CONSTRAINT games_approval_status_check CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  comment text NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Buyer inquiries table
CREATE TABLE IF NOT EXISTS buyer_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  offer_amount numeric(10,2),
  message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT buyer_inquiries_status_check CHECK (status IN ('pending', 'responded', 'accepted', 'declined'))
);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business hours and announcements
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT business_hours_day_check CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public policies for games (approved games visible to everyone)
CREATE POLICY "Anyone can view approved games" ON games
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Anyone can submit games" ON games
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Game owners can update their pending games" ON games
  FOR UPDATE USING (
    approval_status = 'pending' AND 
    owner_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Admin policies for games (authenticated users can manage all games)
CREATE POLICY "Authenticated users can manage all games" ON games
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Repair policies
CREATE POLICY "Anyone can view repairs for approved games" ON repairs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = repairs.game_id 
      AND games.approval_status = 'approved'
    )
  );

CREATE POLICY "Anyone can submit repair requests" ON repairs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage repairs" ON repairs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Buyer inquiry policies
CREATE POLICY "Anyone can submit buyer inquiries" ON buyer_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all inquiries" ON buyer_inquiries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage inquiries" ON buyer_inquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- FAQ policies
CREATE POLICY "Anyone can view FAQs" ON faqs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage FAQs" ON faqs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Business hours policies
CREATE POLICY "Anyone can view business hours" ON business_hours
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage hours" ON business_hours
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Announcement policies
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage announcements" ON announcements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_approval_status ON games(approval_status);
CREATE INDEX IF NOT EXISTS idx_games_for_sale ON games(for_sale) WHERE for_sale = true;
CREATE INDEX IF NOT EXISTS idx_games_owner_email ON games(owner_email);
CREATE INDEX IF NOT EXISTS idx_repairs_game_id ON repairs(game_id);
CREATE INDEX IF NOT EXISTS idx_buyer_inquiries_game_id ON buyer_inquiries(game_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_inquiries_updated_at BEFORE UPDATE ON buyer_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
