/*
  # Fix repair policies for admin bypass user
  
  Allow the admin bypass user (admin@test.com) to create and manage repairs.
*/

-- Allow admin bypass user to create repairs
CREATE POLICY "Admin bypass can create repairs" ON repairs
  FOR INSERT TO authenticated 
  WITH CHECK (auth.email() = 'admin@test.com');

-- Allow admin bypass user to view repairs
CREATE POLICY "Admin bypass can view repairs" ON repairs
  FOR SELECT TO authenticated 
  USING (auth.email() = 'admin@test.com');

-- Allow admin bypass user to update repairs
CREATE POLICY "Admin bypass can update repairs" ON repairs
  FOR UPDATE TO authenticated 
  USING (auth.email() = 'admin@test.com')
  WITH CHECK (auth.email() = 'admin@test.com');
