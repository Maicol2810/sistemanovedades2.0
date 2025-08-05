/*
  # Fix RLS for users table

  1. Changes
    - Enable RLS on users table (was disabled)
    - Update policies to work with custom authentication system
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create new policies that work with our custom auth system
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING ((id)::text = (uid())::text);

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users users_1
      WHERE ((users_1.id)::text = (uid())::text) 
      AND (users_1.role = 'Admin'::text)
    )
  );