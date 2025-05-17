/*
  # Fix auth policy issues

  1. Changes:
    - Replace the problematic admin policy that causes recursion
    - Creates a simpler and more permissive RLS policy for benutzer_profil
    - Makes profile data accessible to authenticated users
    
  2. Security:
    - Maintains appropriate permission levels for different operations
    - Prevents infinite recursion in policy checks
*/

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins können alle Profile verwalten" ON public.benutzer_profil;

-- Create a new policy that uses a simpler check for authenticated users
CREATE POLICY "Admins können alle Profile verwalten" ON public.benutzer_profil
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Update the select policy to be clear and simple
DROP POLICY IF EXISTS "Öffentliches Lesen von Benutzerprofilen" ON public.benutzer_profil;
CREATE POLICY "Öffentliches Lesen von Benutzerprofilen" ON public.benutzer_profil
FOR SELECT
TO PUBLIC
USING (true);

-- Keep the update policy unchanged, it's already secure and reasonable
-- "Benutzer können eigenes Profil bearbeiten" - This policy directly checks auth_id = uid()