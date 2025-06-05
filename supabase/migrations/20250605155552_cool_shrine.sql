/*
  # Update Admin Policies

  1. Changes
    - Update all admin policies to include brian@replaymuseum.com
    - Modify existing policies for business_hours, special_hours, and announcements
    - Ensure consistent admin access across all tables

  2. Security
    - Maintains existing RLS policies
    - Updates admin email list in all relevant policies
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Managers can modify business hours" ON public.business_hours;
    DROP POLICY IF EXISTS "Managers can modify special hours" ON public.special_hours;
    DROP POLICY IF EXISTS "Managers can modify announcements" ON public.announcements;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Recreate policies with updated admin list
CREATE POLICY "Managers can modify business hours"
    ON public.business_hours
    FOR ALL
    TO authenticated
    USING (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com'))
    WITH CHECK (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com'));

CREATE POLICY "Managers can modify special hours"
    ON public.special_hours
    FOR ALL
    TO authenticated
    USING (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com'))
    WITH CHECK (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com'));

CREATE POLICY "Managers can modify announcements"
    ON public.announcements
    FOR ALL
    TO authenticated
    USING (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com'))
    WITH CHECK (auth.email() IN ('amy@straylite.com', 'fred@replaymuseum.com', 'play@replaymuseum.com', 'brian@replaymuseum.com'));