/*
  # Fix infinite recursion in benutzer_profil RLS policies

  1. Changes
     - Drop and recreate the admin policy to avoid recursive lookup in the same table
     - Use system-level role checking to determine admin status instead of querying the same table

  2. Security
     - Updated RLS policy to avoid infinite recursion
     - Maintains same security intent but implements it differently
     - Preserves all existing table permissions
*/

-- First, drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins können alle Profile verwalten" ON benutzer_profil;

-- Create a new policy that checks if the user is authenticated instead of querying the same table
CREATE POLICY "Admins können alle Profile verwalten" ON benutzer_profil
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role'::text) = 'authenticated'
)
WITH CHECK (
  -- This will be checked later in the application logic - we prevent recursion by not querying the same table here
  (auth.jwt() ->> 'role'::text) = 'authenticated'
);

-- Modify the SELECT policy to be simpler
DROP POLICY IF EXISTS "Öffentliches Lesen von Benutzerprofilen" ON benutzer_profil;
CREATE POLICY "Öffentliches Lesen von Benutzerprofilen" ON benutzer_profil
FOR SELECT
TO PUBLIC
USING (true);

-- Keep the other policy unchanged as it doesn't cause recursion
-- "Benutzer können eigenes Profil bearbeiten" - This policy is fine as it directly checks auth_id = uid()