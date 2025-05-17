-- Drop all existing policies on benutzer_profil to start fresh
DROP POLICY IF EXISTS "Öffentliches Lesen von Benutzerprofilen" ON public.benutzer_profil;
DROP POLICY IF EXISTS "Benutzer können eigenes Profil bearbeiten" ON public.benutzer_profil;
DROP POLICY IF EXISTS "Admins können alle Profile verwalten" ON public.benutzer_profil;

-- Create three simple, non-recursive policies:

-- 1. Everyone can read all profiles
CREATE POLICY "Anyone can read profiles" ON public.benutzer_profil
  FOR SELECT TO PUBLIC
  USING (true);

-- 2. Users can update only their own profile
CREATE POLICY "Users can update own profile" ON public.benutzer_profil
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- 3. Users can insert only their own profile (for completeness)
CREATE POLICY "Users can insert own profile" ON public.benutzer_profil
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Note: We're deliberately using simpler policy names in English 
-- to ensure no special characters cause issues