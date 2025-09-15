-- Add RLS policies for admin bypass user to access buyer inquiries
-- This allows the admin@test.com account to view and manage buyer inquiries

-- Allow admin bypass user to view buyer inquiries
CREATE POLICY "Admin bypass can view buyer inquiries" ON buyer_inquiries
  FOR SELECT TO authenticated 
  USING (auth.email() = 'admin@test.com');

-- Allow admin bypass user to update buyer inquiries  
CREATE POLICY "Admin bypass can update buyer inquiries" ON buyer_inquiries
  FOR UPDATE TO authenticated 
  USING (auth.email() = 'admin@test.com')
  WITH CHECK (auth.email() = 'admin@test.com');

-- Allow admin bypass user to delete buyer inquiries (if needed)
CREATE POLICY "Admin bypass can delete buyer inquiries" ON buyer_inquiries
  FOR DELETE TO authenticated 
  USING (auth.email() = 'admin@test.com');
