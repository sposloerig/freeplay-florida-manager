/*
  # Add private notes to buyer inquiries

  1. Changes
    - Add `manager_notes` column to `buyer_inquiries` table
    - This field will store private notes that only managers can see and edit
    - Notes are for internal tracking purposes only

  2. Security
    - Field is nullable to allow existing records to work
    - No additional policies needed as access is already restricted to managers
*/

-- Add manager_notes column to buyer_inquiries table
ALTER TABLE buyer_inquiries 
ADD COLUMN IF NOT EXISTS manager_notes text;