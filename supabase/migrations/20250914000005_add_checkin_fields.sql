-- Add check-in fields to games table

DO $$
BEGIN
  -- Add checked_in field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'checked_in'
  ) THEN
    ALTER TABLE games ADD COLUMN checked_in boolean DEFAULT false;
  END IF;

  -- Add checked_in_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'checked_in_at'
  ) THEN
    ALTER TABLE games ADD COLUMN checked_in_at timestamptz;
  END IF;

  -- Add checked_in_by field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'checked_in_by'
  ) THEN
    ALTER TABLE games ADD COLUMN checked_in_by text;
  END IF;

  -- Add has_key field for verification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'has_key'
  ) THEN
    ALTER TABLE games ADD COLUMN has_key boolean DEFAULT false;
  END IF;

  -- Add working_condition field for verification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'working_condition'
  ) THEN
    ALTER TABLE games ADD COLUMN working_condition boolean DEFAULT false;
  END IF;

  -- Add check_in_notes field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'check_in_notes'
  ) THEN
    ALTER TABLE games ADD COLUMN check_in_notes text;
  END IF;
END $$;
