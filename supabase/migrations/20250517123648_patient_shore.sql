-- ==========================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==========================================

-- Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS benutzer_profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS benutzer_statistik ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS benutzer_abzeichen ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gerichte ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gericht_restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bewertungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abzeichen_definitionen ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_protokoll ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. RLS POLICIES FOR benutzer_profil
-- ========================================

-- Everyone can view basic profile information
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Öffentliches Lesen von Benutzerprofilen'
  ) THEN
    CREATE POLICY "Öffentliches Lesen von Benutzerprofilen"
      ON benutzer_profil FOR SELECT
      USING (true);
  END IF;
END $$;

-- Users can update their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Benutzer können eigenes Profil bearbeiten'
  ) THEN
    CREATE POLICY "Benutzer können eigenes Profil bearbeiten"
      ON benutzer_profil FOR UPDATE
      USING (auth.uid() = auth_id)
      WITH CHECK (auth.uid() = auth_id);
  END IF;
END $$;

-- Admins can manage all profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_profil' AND policyname = 'Admins können alle Profile verwalten'
  ) THEN
    CREATE POLICY "Admins können alle Profile verwalten"
      ON benutzer_profil FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 3. RLS POLICIES FOR gerichte
-- ========================================

-- Everyone can view dishes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'gerichte' AND policyname = 'Jeder kann Gerichte sehen'
  ) THEN
    CREATE POLICY "Jeder kann Gerichte sehen"
      ON gerichte FOR SELECT
      USING (true);
  END IF;
END $$;

-- Only admins and moderators can create dishes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'gerichte' AND policyname = 'Nur Admins und Moderatoren können Gerichte erstellen'
  ) THEN
    CREATE POLICY "Nur Admins und Moderatoren können Gerichte erstellen"
      ON gerichte FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle IN ('admin', 'moderator')
        )
      );
  END IF;
END $$;

-- Only admins and moderators can update dishes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'gerichte' AND policyname = 'Nur Admins und Moderatoren können Gerichte aktualisieren'
  ) THEN
    CREATE POLICY "Nur Admins und Moderatoren können Gerichte aktualisieren"
      ON gerichte FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle IN ('admin', 'moderator')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle IN ('admin', 'moderator')
        )
      );
  END IF;
END $$;

-- ========================================
-- 4. RLS POLICIES FOR restaurants
-- ========================================

-- Everyone can view restaurants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'restaurants' AND policyname = 'Jeder kann Restaurants sehen'
  ) THEN
    CREATE POLICY "Jeder kann Restaurants sehen"
      ON restaurants FOR SELECT
      USING (true);
  END IF;
END $$;

-- Authenticated users can add restaurants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'restaurants' AND policyname = 'Authentifizierte Benutzer können Restaurants hinzufügen'
  ) THEN
    CREATE POLICY "Authentifizierte Benutzer können Restaurants hinzufügen"
      ON restaurants FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Only creators, admins, and moderators can update their restaurants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'restaurants' AND policyname = 'Ersteller, Admins und Moderatoren können Restaurants aktualisieren'
  ) THEN
    CREATE POLICY "Ersteller, Admins und Moderatoren können Restaurants aktualisieren"
      ON restaurants FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = restaurants.erstellt_von 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = restaurants.erstellt_von 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      );
  END IF;
END $$;

-- ========================================
-- 5. RLS POLICIES FOR gericht_restaurant
-- ========================================

-- Everyone can view dish-restaurant connections
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'gericht_restaurant' AND policyname = 'Jeder kann Gericht-Restaurant-Verbindungen sehen'
  ) THEN
    CREATE POLICY "Jeder kann Gericht-Restaurant-Verbindungen sehen"
      ON gericht_restaurant FOR SELECT
      USING (true);
  END IF;
END $$;

-- Only admins and moderators can manage dish-restaurant connections
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'gericht_restaurant' AND policyname = 'Moderatoren und Admins können Gericht-Restaurant-Verbindungen verwalten'
  ) THEN
    CREATE POLICY "Moderatoren und Admins können Gericht-Restaurant-Verbindungen verwalten"
      ON gericht_restaurant FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle IN ('admin', 'moderator')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle IN ('admin', 'moderator')
        )
      );
  END IF;
END $$;

-- ========================================
-- 6. RLS POLICIES FOR fotos
-- ========================================

-- Only approved photos are visible to everyone, creators and admins can see all their photos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'fotos' AND policyname = 'Jeder kann genehmigte Fotos sehen'
  ) THEN
    CREATE POLICY "Jeder kann genehmigte Fotos sehen"
      ON fotos FOR SELECT
      USING (
        ist_genehmigt = true
        OR EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = fotos.benutzer_id 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      );
  END IF;
END $$;

-- Authenticated users can upload photos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'fotos' AND policyname = 'Authentifizierte Benutzer können Fotos hochladen'
  ) THEN
    CREATE POLICY "Authentifizierte Benutzer können Fotos hochladen"
      ON fotos FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.id = fotos.benutzer_id
        )
      );
  END IF;
END $$;

-- Users can update their own photos, admins and moderators can update any photo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'fotos' AND policyname = 'Benutzer können eigene Fotos aktualisieren'
  ) THEN
    CREATE POLICY "Benutzer können eigene Fotos aktualisieren"
      ON fotos FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = fotos.benutzer_id 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = fotos.benutzer_id 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      );
  END IF;
END $$;

-- Only admins can delete photos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'fotos' AND policyname = 'Nur Admins können Fotos löschen'
  ) THEN
    CREATE POLICY "Nur Admins können Fotos löschen"
      ON fotos FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 7. RLS POLICIES FOR bewertungen
-- ========================================

-- Everyone can view ratings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'bewertungen' AND policyname = 'Jeder kann Bewertungen sehen'
  ) THEN
    CREATE POLICY "Jeder kann Bewertungen sehen"
      ON bewertungen FOR SELECT
      USING (true);
  END IF;
END $$;

-- Authenticated users can submit ratings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'bewertungen' AND policyname = 'Authentifizierte Benutzer können Bewertungen abgeben'
  ) THEN
    CREATE POLICY "Authentifizierte Benutzer können Bewertungen abgeben"
      ON bewertungen FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.id = bewertungen.benutzer_id
        )
      );
  END IF;
END $$;

-- Users can update their own ratings, admins and moderators can update any rating
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'bewertungen' AND policyname = 'Benutzer können eigene Bewertungen aktualisieren'
  ) THEN
    CREATE POLICY "Benutzer können eigene Bewertungen aktualisieren"
      ON bewertungen FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = bewertungen.benutzer_id 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND (
            benutzer_profil.id = bewertungen.benutzer_id 
            OR benutzer_profil.rolle IN ('admin', 'moderator')
          )
        )
      );
  END IF;
END $$;

-- Only admins and moderators can delete ratings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'bewertungen' AND policyname = 'Admins und Moderatoren können Bewertungen löschen'
  ) THEN
    CREATE POLICY "Admins und Moderatoren können Bewertungen löschen"
      ON bewertungen FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle IN ('admin', 'moderator')
        )
      );
  END IF;
END $$;

-- ========================================
-- 8. RLS POLICIES FOR benutzer_statistik
-- ========================================

-- Everyone can view user statistics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_statistik' AND policyname = 'Jeder kann Benutzerstatistiken sehen'
  ) THEN
    CREATE POLICY "Jeder kann Benutzerstatistiken sehen"
      ON benutzer_statistik FOR SELECT
      USING (true);
  END IF;
END $$;

-- Only system (via triggers) and admins can update statistics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_statistik' AND policyname = 'System und Admins können Statistiken aktualisieren'
  ) THEN
    CREATE POLICY "System und Admins können Statistiken aktualisieren"
      ON benutzer_statistik FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 9. RLS POLICIES FOR abzeichen_definitionen
-- ========================================

-- Everyone can view badge definitions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'abzeichen_definitionen' AND policyname = 'Jeder kann Abzeichen-Definitionen sehen'
  ) THEN
    CREATE POLICY "Jeder kann Abzeichen-Definitionen sehen"
      ON abzeichen_definitionen FOR SELECT
      USING (true);
  END IF;
END $$;

-- Only admins can manage badge definitions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'abzeichen_definitionen' AND policyname = 'Nur Admins können Abzeichen-Definitionen verwalten'
  ) THEN
    CREATE POLICY "Nur Admins können Abzeichen-Definitionen verwalten"
      ON abzeichen_definitionen FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 10. RLS POLICIES FOR benutzer_abzeichen
-- ========================================

-- Everyone can see who has which badges
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_abzeichen' AND policyname = 'Jeder kann sehen wer welche Abzeichen hat'
  ) THEN
    CREATE POLICY "Jeder kann sehen wer welche Abzeichen hat"
      ON benutzer_abzeichen FOR SELECT
      USING (true);
  END IF;
END $$;

-- Only system (via triggers) and admins can award badges
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'benutzer_abzeichen' AND policyname = 'Nur System und Admins können Abzeichen vergeben'
  ) THEN
    CREATE POLICY "Nur System und Admins können Abzeichen vergeben"
      ON benutzer_abzeichen FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 11. RLS POLICIES FOR admin_protokoll
-- ========================================

-- Only admins can view admin activity log
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'admin_protokoll' AND policyname = 'Nur Admins können Admin-Protokoll sehen'
  ) THEN
    CREATE POLICY "Nur Admins können Admin-Protokoll sehen"
      ON admin_protokoll FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- System writes admin log entries
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'admin_protokoll' AND policyname = 'System schreibt Admin-Protokoll'
  ) THEN
    CREATE POLICY "System schreibt Admin-Protokoll"
      ON admin_protokoll FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM benutzer_profil 
          WHERE benutzer_profil.auth_id = auth.uid() 
          AND benutzer_profil.rolle = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 12. TRIGGER FUNCTIONS
-- ========================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.benutzer_profil (auth_id, benutzername, rolle, sprache)
  VALUES (new.id, new.email, 'benutzer', 'de');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user statistics when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.benutzer_statistik (id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin log entry
CREATE OR REPLACE FUNCTION public.log_admin_action(admin_id uuid, action_text text, details_json jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_protokoll (admin_id, aktion, details)
  VALUES (admin_id, action_text, details_json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin or moderator (can only be executed by admins)
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_email text, new_role text)
RETURNS void AS $$
DECLARE
  acting_user_id uuid;
  acting_user_role text;
  target_user_id uuid;
  target_profile_id uuid;
BEGIN
  -- Get acting user's ID and role
  SELECT id, rolle INTO acting_user_id, acting_user_role 
  FROM auth.users 
  JOIN public.benutzer_profil ON auth.users.id = public.benutzer_profil.auth_id
  WHERE auth.users.id = auth.uid();
  
  -- Check if acting user is admin
  IF acting_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  
  -- Check if new_role is valid
  IF new_role NOT IN ('benutzer', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be one of: benutzer, moderator, admin';
  END IF;
  
  -- Get target user's ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_user_email;
  END IF;
  
  -- Get target user's profile ID
  SELECT id INTO target_profile_id
  FROM public.benutzer_profil
  WHERE auth_id = target_user_id;
  
  -- Update the role
  UPDATE public.benutzer_profil
  SET rolle = new_role
  WHERE id = target_profile_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    acting_user_id,
    'Rolle geändert',
    jsonb_build_object(
      'target_user', target_user_email,
      'old_role', (SELECT rolle FROM public.benutzer_profil WHERE id = target_profile_id),
      'new_role', new_role
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 13. TRIGGERS
-- ========================================

-- Create a trigger to create user profile when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a trigger to create user stats when a profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.benutzer_profil;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.benutzer_profil
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
