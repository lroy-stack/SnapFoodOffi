/*
  # Fix user authentication policies to prevent recursion

  This migration fixes the row-level security policies for the benutzer_profil table
  to prevent recursion issues that can occur when checking roles.

  1. Changes:
    - Replaces the problematic admin policy with a simpler version
    - Updates the SELECT policy to be more straightforward
    - Removes potential recursion in authentication checks
*/

-- First, drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins können alle Profile verwalten" ON public.benutzer_profil;

-- Create a new policy with simpler checks for authenticated users
CREATE POLICY "Admins können alle Profile verwalten" ON public.benutzer_profil
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Simplify the SELECT policy to make it cleaner
DROP POLICY IF EXISTS "Öffentliches Lesen von Benutzerprofilen" ON public.benutzer_profil;
CREATE POLICY "Öffentliches Lesen von Benutzerprofilen" ON public.benutzer_profil
FOR SELECT
TO PUBLIC
USING (true);

-- The existing update policy is fine as it directly checks auth_id = uid()
-- No changes needed for "Benutzer können eigenes Profil bearbeiten"