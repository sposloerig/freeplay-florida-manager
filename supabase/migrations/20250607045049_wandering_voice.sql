/*
  # Enable Public Repair Reporting

  1. Security Changes
    - Add policy to allow public users to insert repair records
    - Maintain existing policies for authenticated users to view/manage repairs
    - Keep game status updates restricted to authenticated users only

  2. Notes
    - Public users can only create repair records, not view or modify existing ones
    - Game status updates will only happen if the game is currently "Operational"
    - This allows visitors to report issues without requiring authentication
*/

-- Allow public users to insert repair records
CREATE POLICY "Public users can report repairs"
  ON repairs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Note: We're not modifying the games table policies since we want to keep
-- game status updates restricted. The application will handle status updates
-- through the existing authenticated policies when possible.