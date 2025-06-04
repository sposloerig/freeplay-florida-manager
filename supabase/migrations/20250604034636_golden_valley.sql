-- Update the default business hours with 12-hour format times
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