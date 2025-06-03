/*
  # Create business hours and announcements tables

  1. New Tables
    - `business_hours`: Store regular operating hours
    - `special_hours`: Store holiday/special hours
    - `announcements`: Store important announcements
    
  2. Security
    - Enable RLS on all tables
    - Add policies for public viewing
    - Add policies for manager modifications
*/

-- Create business_hours table
CREATE TABLE IF NOT EXISTS public.business_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time time without time zone NOT NULL,
    close_time time without time zone NOT NULL,
    is_closed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS business_hours_day_of_week_key ON public.business_hours (day_of_week);

-- Create special_hours table
CREATE TABLE IF NOT EXISTS public.special_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL UNIQUE,
    open_time time without time zone,
    close_time time without time zone,
    is_closed boolean DEFAULT false,
    reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
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
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can view business hours" ON public.business_hours;
    DROP POLICY IF EXISTS "Managers can modify business hours" ON public.business_hours;
    DROP POLICY IF EXISTS "Public can view special hours" ON public.special_hours;
    DROP POLICY IF EXISTS "Managers can modify special hours" ON public.special_hours;
    DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Managers can modify announcements" ON public.announcements;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Policies for business_hours
CREATE POLICY "Public can view business hours"
    ON public.business_hours
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Managers can modify business hours"
    ON public.business_hours
    FOR ALL
    TO authenticated
    USING (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com'))
    WITH CHECK (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com'));

-- Policies for special_hours
CREATE POLICY "Public can view special hours"
    ON public.special_hours
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Managers can modify special hours"
    ON public.special_hours
    FOR ALL
    TO authenticated
    USING (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com'))
    WITH CHECK (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com'));

-- Policies for announcements
CREATE POLICY "Public can view announcements"
    ON public.announcements
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Managers can modify announcements"
    ON public.announcements
    FOR ALL
    TO authenticated
    USING (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com'))
    WITH CHECK (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com'));

-- Insert default business hours
INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_closed) VALUES
    (0, '11:00', '19:00', false), -- Sunday
    (1, '00:00', '00:00', true),  -- Monday (Closed)
    (2, '00:00', '00:00', true),  -- Tuesday (Closed)
    (3, '11:00', '19:00', false), -- Wednesday
    (4, '11:00', '19:00', false), -- Thursday
    (5, '11:00', '23:00', false), -- Friday
    (6, '11:00', '23:00', false)  -- Saturday
ON CONFLICT (day_of_week) DO UPDATE
SET 
    open_time = EXCLUDED.open_time,
    close_time = EXCLUDED.close_time,
    is_closed = EXCLUDED.is_closed;

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_business_hours_updated_at ON public.business_hours;
    DROP TRIGGER IF EXISTS update_special_hours_updated_at ON public.special_hours;
    DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create triggers
CREATE TRIGGER update_business_hours_updated_at
    BEFORE UPDATE ON public.business_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_hours_updated_at
    BEFORE UPDATE ON public.special_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();