/*
  # Auto-mark games for sale when price is added

  1. Function
    - Create function to automatically set for_sale = true when asking_price > 0
    - Set for_sale = false when asking_price is null or 0

  2. Trigger
    - Apply function on INSERT and UPDATE of games table
    - Only affects asking_price and for_sale columns
*/

-- Create function to auto-set for_sale based on asking_price
CREATE OR REPLACE FUNCTION auto_set_for_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- If asking_price is set and greater than 0, mark for sale
  IF NEW.asking_price IS NOT NULL AND NEW.asking_price > 0 THEN
    NEW.for_sale = true;
  -- If asking_price is null or 0, and for_sale wasn't explicitly set to true, mark as not for sale
  ELSIF (NEW.asking_price IS NULL OR NEW.asking_price = 0) AND 
        (TG_OP = 'INSERT' OR OLD.for_sale = false OR 
         (TG_OP = 'UPDATE' AND NEW.for_sale = OLD.for_sale)) THEN
    NEW.for_sale = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting for_sale
DROP TRIGGER IF EXISTS auto_set_for_sale_trigger ON games;
CREATE TRIGGER auto_set_for_sale_trigger
  BEFORE INSERT OR UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_for_sale();

-- Update existing games with prices to be for sale
UPDATE games 
SET for_sale = true 
WHERE asking_price IS NOT NULL AND asking_price > 0 AND for_sale = false;