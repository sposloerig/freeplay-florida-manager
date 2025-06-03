/*
  # Add business hours and announcements management

  1. New Tables
    - `business_hours`: Store regular operating hours
    - `special_hours`: Store holiday/special hours
    - `announcements`: Store temporary announcements/banners

  2. Security
    - Enable RLS
    - Public can view all records
    - Only managers can modify
*/

-- Business hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (day_of_week)
);

-- Special hours table for holidays and temporary changes
CREATE TABLE IF NOT EXISTS special_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (date)
);

-- Announcements table for banners
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view business hours"
  ON business_hours FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view special hours"
  ON special_hours FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view announcements"
  ON announcements FOR SELECT
  TO public
  USING (true);

-- Manager write access
CREATE POLICY "Managers can modify business hours"
  ON business_hours
  FOR ALL
  TO authenticated
  USING (auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com'
  ))
  WITH CHECK (auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com'
  ));

CREATE POLICY "Managers can modify special hours"
  ON special_hours
  FOR ALL
  TO authenticated
  USING (auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com'
  ))
  WITH CHECK (auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com'
  ));

CREATE POLICY "Managers can modify announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com'
  ))
  WITH CHECK (auth.email() IN (
    'amy@straylite.com',
    'fred@replaymuseum.com',
    'play@replaymuseum.com'
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_hours_updated_at
  BEFORE UPDATE ON special_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default business hours
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '11:00', '19:00', false), -- Sunday
  (1, '00:00', '00:00', true),  -- Monday (closed)
  (2, '00:00', '00:00', true),  -- Tuesday (closed)
  (3, '11:00', '19:00', false), -- Wednesday
  (4, '11:00', '19:00', false), -- Thursday
  (5, '11:00', '23:00', false), -- Friday
  (6, '11:00', '23:00', false); -- Saturday