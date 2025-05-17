/*
  # Fix recursive RLS policies in benutzer_profil

  1. Changes
    - Safely drops existing policies if they exist
    - Adds three simple, non-recursive policies with conditional creation
    - Uses English policy names to avoid character encoding issues

  2. Security
    - Maintains same security intent but prevents infinite recursion
    - Anyone can read profiles
    - Only authenticated users can modify their own profiles
*/

-- Drop problematic policies if they exist
DO $$ 
BEGIN
  -- Drop policies with German names if they exist
  IF EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Öffentliches Lesen von Benutzerprofilen'
  ) THEN
    DROP POLICY "Öffentliches Lesen von Benutzerprofilen" ON public.benutzer_profil;
  END IF;

  IF EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Benutzer können eigenes Profil bearbeiten'
  ) THEN  
    DROP POLICY "Benutzer können eigenes Profil bearbeiten" ON public.benutzer_profil;
  END IF;

  IF EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Admins können alle Profile verwalten'
  ) THEN
    DROP POLICY "Admins können alle Profile verwalten" ON public.benutzer_profil;
  END IF;
END $$;

-- Create three simple, non-recursive policies with conditional creation:

-- 1. Everyone can read all profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Anyone can read profiles'
  ) THEN
    CREATE POLICY "Anyone can read profiles" ON public.benutzer_profil
      FOR SELECT TO PUBLIC
      USING (true);
  END IF;
END $$;

-- 2. Users can update only their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.benutzer_profil
      FOR UPDATE TO authenticated
      USING (auth.uid() = auth_id)
      WITH CHECK (auth.uid() = auth_id);
  END IF;
END $$;

-- 3. Users can insert only their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.benutzer_profil
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = auth_id);
  END IF;
END $$;