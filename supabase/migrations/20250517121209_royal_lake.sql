/*
  # FoodSnap Vienna Database Schema

  1. New Tables
    - `benutzer_profil` - User profiles with authentication info
    - `gerichte` - Dishes with multilingual names and descriptions
    - `restaurants` - Restaurant details including location
    - `gericht_restaurant` - Junction table linking dishes and restaurants
    - `fotos` - User-uploaded photos with metadata
    - `bewertungen` - User reviews and ratings
    - `benutzer_statistik` - User statistics for gamification
    - `abzeichen_definitionen` - Badge definitions
    - `benutzer_abzeichen` - User-earned badges
    - `admin_protokoll` - Admin action logs

  2. Security
    - Enable RLS on all tables
    - Configure access policies for authenticated and anonymous users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Benutzer Profil (User Profile)
CREATE TABLE IF NOT EXISTS benutzer_profil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  benutzername TEXT UNIQUE NOT NULL,
  anzeigename TEXT,
  profilbild_url TEXT,
  sprache TEXT DEFAULT 'de' CHECK (sprache IN ('de', 'en')),
  rolle TEXT DEFAULT 'benutzer' CHECK (rolle IN ('benutzer', 'moderator', 'admin')),
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

-- 2. Gerichte (Dishes)
CREATE TABLE IF NOT EXISTS gerichte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  beschreibung_de TEXT,
  beschreibung_en TEXT,
  kategorie TEXT NOT NULL CHECK (kategorie IN ('hauptgericht', 'nachspeise', 'vorspeise', 'getränk')),
  bild_url TEXT,
  herkunft TEXT,
  preisklasse SMALLINT DEFAULT 2 CHECK (preisklasse BETWEEN 1 AND 3),
  beliebtheit INTEGER DEFAULT 0,
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now(),
  erstellt_von UUID REFERENCES benutzer_profil(id)
);

-- 3. Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  adresse TEXT NOT NULL,
  koordinaten POINT NOT NULL,
  bezirk TEXT,
  oeffnungszeiten JSONB,
  kontaktdaten JSONB,
  preisklasse SMALLINT DEFAULT 2 CHECK (preisklasse BETWEEN 1 AND 3),
  bewertung NUMERIC(3,2) DEFAULT 0 CHECK (bewertung BETWEEN 0 AND 5),
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now(),
  erstellt_von UUID REFERENCES benutzer_profil(id)
);

-- 4. Gericht Restaurant (Junction table)
CREATE TABLE IF NOT EXISTS gericht_restaurant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gericht_id UUID NOT NULL REFERENCES gerichte(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  verfügbar BOOLEAN DEFAULT TRUE,
  preis NUMERIC(10,2),
  spezielle_notizen TEXT,
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gericht_id, restaurant_id)
);

-- 5. Fotos (User uploads)
CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benutzer_id UUID NOT NULL REFERENCES benutzer_profil(id) ON DELETE CASCADE,
  gericht_id UUID REFERENCES gerichte(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  foto_url TEXT NOT NULL,
  beschreibung TEXT,
  aufgenommen_am TIMESTAMPTZ,
  hochgeladen_am TIMESTAMPTZ DEFAULT now(),
  ist_genehmigt BOOLEAN DEFAULT FALSE,
  is_hauptbild BOOLEAN DEFAULT FALSE
);

-- 6. Bewertungen (Reviews)
CREATE TABLE IF NOT EXISTS bewertungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benutzer_id UUID NOT NULL REFERENCES benutzer_profil(id) ON DELETE CASCADE,
  gericht_id UUID REFERENCES gerichte(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  gericht_restaurant_id UUID REFERENCES gericht_restaurant(id) ON DELETE SET NULL,
  bewertung SMALLINT NOT NULL CHECK (bewertung BETWEEN 1 AND 5),
  kommentar TEXT,
  foto_id UUID REFERENCES fotos(id) ON DELETE SET NULL,
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (gericht_id IS NOT NULL) OR 
    (restaurant_id IS NOT NULL) OR 
    (gericht_restaurant_id IS NOT NULL)
  )
);

-- 7. Benutzer Statistik (User stats for gamification)
CREATE TABLE IF NOT EXISTS benutzer_statistik (
  id UUID PRIMARY KEY REFERENCES benutzer_profil(id) ON DELETE CASCADE,
  punkte INTEGER DEFAULT 0,
  level SMALLINT DEFAULT 1,
  bewertungen_anzahl INTEGER DEFAULT 0,
  kommentare_anzahl INTEGER DEFAULT 0,
  fotos_anzahl INTEGER DEFAULT 0,
  besuchte_restaurants INTEGER DEFAULT 0,
  probierte_gerichte INTEGER DEFAULT 0,
  aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

-- 8. Abzeichen Definitionen (Badge definitions)
CREATE TABLE IF NOT EXISTS abzeichen_definitionen (
  id TEXT PRIMARY KEY,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  beschreibung_de TEXT NOT NULL,
  beschreibung_en TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  kategorie TEXT NOT NULL CHECK (kategorie IN ('fotografie', 'kommentare', 'bewertungen', 'erkundung', 'gerichte')),
  level_erforderlich SMALLINT DEFAULT 1,
  erstellt_am TIMESTAMPTZ DEFAULT now()
);

-- 9. Benutzer Abzeichen (User badges)
CREATE TABLE IF NOT EXISTS benutzer_abzeichen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benutzer_id UUID NOT NULL REFERENCES benutzer_profil(id) ON DELETE CASCADE,
  abzeichen_id TEXT NOT NULL REFERENCES abzeichen_definitionen(id) ON DELETE CASCADE,
  erhalten_am TIMESTAMPTZ DEFAULT now(),
  UNIQUE(benutzer_id, abzeichen_id)
);

-- 10. Admin Protokoll (Admin logs)
CREATE TABLE IF NOT EXISTS admin_protokoll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES benutzer_profil(id),
  aktion TEXT NOT NULL,
  details JSONB,
  durchgeführt_am TIMESTAMPTZ DEFAULT now()
);

-- Create updatable view for calculating restaurant ratings
CREATE OR REPLACE VIEW restaurant_bewertungen AS
SELECT 
  restaurant_id,
  AVG(bewertung) as durchschnittliche_bewertung,
  COUNT(*) as anzahl_bewertungen
FROM bewertungen
WHERE restaurant_id IS NOT NULL
GROUP BY restaurant_id;

-- Create updatable view for calculating dish ratings
CREATE OR REPLACE VIEW gericht_bewertungen AS
SELECT 
  gericht_id,
  AVG(bewertung) as durchschnittliche_bewertung,
  COUNT(*) as anzahl_bewertungen
FROM bewertungen
WHERE gericht_id IS NOT NULL
GROUP BY gericht_id;

-- Functions for updating statistics
CREATE OR REPLACE FUNCTION update_dish_popularity() RETURNS TRIGGER AS $$
BEGIN
  UPDATE gerichte
  SET beliebtheit = subquery.durchschnittliche_bewertung * 20
  FROM gericht_bewertungen as subquery
  WHERE gerichte.id = subquery.gericht_id AND gerichte.id = NEW.gericht_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_restaurant_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants
  SET bewertung = subquery.durchschnittliche_bewertung
  FROM restaurant_bewertungen as subquery
  WHERE restaurants.id = subquery.restaurant_id AND restaurants.id = NEW.restaurant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE benutzer_statistik
  SET 
    bewertungen_anzahl = (SELECT COUNT(*) FROM bewertungen WHERE benutzer_id = NEW.benutzer_id),
    punkte = punkte + 1, -- 1 point for a review
    aktualisiert_am = now()
  WHERE id = NEW.benutzer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_photo_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE benutzer_statistik
  SET 
    fotos_anzahl = (SELECT COUNT(*) FROM fotos WHERE benutzer_id = NEW.benutzer_id),
    punkte = punkte + 5, -- 5 points for a photo
    aktualisiert_am = now()
  WHERE id = NEW.benutzer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_level() RETURNS TRIGGER AS $$
BEGIN
  UPDATE benutzer_statistik
  SET level = 
    CASE
      WHEN NEW.punkte < 7 THEN 1 -- Anfänger
      WHEN NEW.punkte < 50 THEN 2 -- Beginner Foodie
      WHEN NEW.punkte < 100 THEN 3 -- Regular Foodie
      WHEN NEW.punkte < 250 THEN 4 -- Featured Foodie
      WHEN NEW.punkte < 500 THEN 5 -- Expert Foodie
      ELSE 6 -- Top Foodie
    END
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trig_update_dish_popularity
AFTER INSERT OR UPDATE ON bewertungen
FOR EACH ROW
WHEN (NEW.gericht_id IS NOT NULL)
EXECUTE FUNCTION update_dish_popularity();

CREATE TRIGGER trig_update_restaurant_rating
AFTER INSERT OR UPDATE ON bewertungen
FOR EACH ROW
WHEN (NEW.restaurant_id IS NOT NULL)
EXECUTE FUNCTION update_restaurant_rating();

CREATE TRIGGER trig_update_user_stats
AFTER INSERT OR UPDATE ON bewertungen
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trig_update_photo_stats
AFTER INSERT OR UPDATE ON fotos
FOR EACH ROW
EXECUTE FUNCTION update_photo_stats();

CREATE TRIGGER trig_update_user_level
AFTER UPDATE OF punkte ON benutzer_statistik
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Row Level Security Policies

-- 1. Enable RLS on all tables
ALTER TABLE benutzer_profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE gerichte ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE gericht_restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bewertungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE benutzer_statistik ENABLE ROW LEVEL SECURITY;
ALTER TABLE abzeichen_definitionen ENABLE ROW LEVEL SECURITY;
ALTER TABLE benutzer_abzeichen ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_protokoll ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for benutzer_profil
CREATE POLICY "Öffentliches Lesen von Benutzerprofilen"
  ON benutzer_profil FOR SELECT
  USING (true);

CREATE POLICY "Benutzer können eigenes Profil bearbeiten"
  ON benutzer_profil FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- 3. RLS Policies for gerichte
CREATE POLICY "Jeder kann Gerichte sehen"
  ON gerichte FOR SELECT
  USING (true);

CREATE POLICY "Nur Admins und Moderatoren können Gerichte erstellen"
  ON gerichte FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Nur Admins und Moderatoren können Gerichte aktualisieren"
  ON gerichte FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin', 'moderator')
    )
  );

-- 4. RLS Policies for restaurants
CREATE POLICY "Jeder kann Restaurants sehen"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authentifizierte Benutzer können Restaurants hinzufügen"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Ersteller, Admins und Moderatoren können Restaurants aktualisieren"
  ON restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND 
      (id = erstellt_von OR rolle IN ('admin', 'moderator'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND 
      (id = erstellt_von OR rolle IN ('admin', 'moderator'))
    )
  );

-- 5. RLS Policies for gericht_restaurant
CREATE POLICY "Jeder kann Gericht-Restaurant-Verbindungen sehen"
  ON gericht_restaurant FOR SELECT
  USING (true);

CREATE POLICY "Moderatoren und Admins können Gericht-Restaurant-Verbindungen verwalten"
  ON gericht_restaurant FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin', 'moderator')
    )
  );

-- 6. RLS Policies for fotos
CREATE POLICY "Jeder kann genehmigte Fotos sehen"
  ON fotos FOR SELECT
  USING (ist_genehmigt = true OR 
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND (id = benutzer_id OR rolle IN ('admin', 'moderator'))
    )
  );

CREATE POLICY "Authentifizierte Benutzer können Fotos hochladen"
  ON fotos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND id = benutzer_id
    )
  );

CREATE POLICY "Benutzer können eigene Fotos aktualisieren"
  ON fotos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND 
      (id = benutzer_id OR rolle IN ('admin', 'moderator'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND 
      (id = benutzer_id OR rolle IN ('admin', 'moderator'))
    )
  );

-- 7. RLS Policies for bewertungen
CREATE POLICY "Jeder kann Bewertungen sehen"
  ON bewertungen FOR SELECT
  USING (true);

CREATE POLICY "Authentifizierte Benutzer können Bewertungen abgeben"
  ON bewertungen FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND id = benutzer_id
    )
  );

CREATE POLICY "Benutzer können eigene Bewertungen aktualisieren"
  ON bewertungen FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND 
      (id = benutzer_id OR rolle IN ('admin', 'moderator'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND 
      (id = benutzer_id OR rolle IN ('admin', 'moderator'))
    )
  );

-- 8. RLS Policies for benutzer_statistik
CREATE POLICY "Jeder kann Benutzerstatistiken sehen"
  ON benutzer_statistik FOR SELECT
  USING (true);

CREATE POLICY "System und Admins können Statistiken aktualisieren"
  ON benutzer_statistik FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle IN ('admin')
    )
  );

-- 9. RLS Policies for abzeichen_definitionen
CREATE POLICY "Jeder kann Abzeichen-Definitionen sehen"
  ON abzeichen_definitionen FOR SELECT
  USING (true);

CREATE POLICY "Nur Admins können Abzeichen-Definitionen verwalten"
  ON abzeichen_definitionen FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle = 'admin'
    )
  );

-- 10. RLS Policies for benutzer_abzeichen
CREATE POLICY "Jeder kann sehen wer welche Abzeichen hat"
  ON benutzer_abzeichen FOR SELECT
  USING (true);

CREATE POLICY "Nur System und Admins können Abzeichen vergeben"
  ON benutzer_abzeichen FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle = 'admin'
    )
  );

-- 11. RLS Policies for admin_protokoll
CREATE POLICY "Nur Admins können Admin-Protokoll sehen"
  ON admin_protokoll FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle = 'admin'
    )
  );

CREATE POLICY "System schreibt Admin-Protokoll"
  ON admin_protokoll FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM benutzer_profil
      WHERE auth_id = auth.uid() AND rolle = 'admin'
    )
  );

-- Sample Data for Abzeichen (Badges)
INSERT INTO abzeichen_definitionen (id, name_de, name_en, beschreibung_de, beschreibung_en, icon_url, kategorie, level_erforderlich) VALUES 
('first-photo', 'Erster Schnappschuss', 'First Snap', 'Dein erstes Foto hochgeladen', 'Uploaded your first photo', '/badges/first-snap.svg', 'fotografie', 1),
('good-foodie', 'Guter Foodie', 'Good Foodie', 'Mehr als 5 Bewertungen abgegeben', 'Submitted more than 5 ratings', '/badges/good-foodie.svg', 'bewertungen', 2),
('local-explorer', 'Lokaler Entdecker', 'Local Explorer', 'Mehr als 3 Bezirke besucht', 'Visited more than 3 districts', '/badges/local-explorer.svg', 'erkundung', 2),
('schnitzel-lover', 'Schnitzel-Liebhaber', 'Schnitzel Lover', '5 verschiedene Schnitzel probiert', 'Tried 5 different schnitzels', '/badges/schnitzel-lover.svg', 'gerichte', 3),
('dessert-expert', 'Dessert-Experte', 'Dessert Expert', '10 verschiedene Nachspeisen bewertet', 'Rated 10 different desserts', '/badges/dessert-expert.svg', 'gerichte', 4);