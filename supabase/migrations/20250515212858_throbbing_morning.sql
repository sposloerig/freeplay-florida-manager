/*
  # Add Events and FAQ tables

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (timestamptz)
      - `time` (text)
      - `type` (text - 'tournament' or 'event')
      - `registration_fee` (numeric, optional)
      - `admission_fee` (numeric, optional)
      - `max_participants` (integer, optional)
      - `current_participants` (integer, optional)
      - `prizes` (text[], optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `faqs`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `category` (text)
      - `order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  time text NOT NULL,
  type text NOT NULL,
  registration_fee numeric(10,2),
  admission_fee numeric(10,2),
  max_participants integer,
  current_participants integer DEFAULT 0,
  prizes text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT events_type_check CHECK (type IN ('tournament', 'event'))
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Enable read access for all users" ON events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON events
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON events
  FOR DELETE TO authenticated USING (true);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- FAQs policies
CREATE POLICY "Enable read access for all users" ON faqs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON faqs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON faqs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON faqs
  FOR DELETE TO authenticated USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();