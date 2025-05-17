/*
  # Add badge definitions

  1. Adds badge definitions for the gamification system
     - Adds 5 initial badges across different categories
     - Skips insertion if badges already exist to avoid duplicates

  2. Badge Categories:
     - fotografie (photography)
     - bewertungen (ratings)
     - erkundung (exploration)
     - gerichte (dishes)
*/

-- Insert badges only if they don't already exist
INSERT INTO "public"."abzeichen_definitionen" 
  ("id", "name_de", "name_en", "beschreibung_de", "beschreibung_en", "icon_url", "kategorie", "level_erforderlich", "erstellt_am") 
VALUES 
  ('first-photo', 'Erster Schnappschuss', 'First Snap', 'Dein erstes Foto hochgeladen', 'Uploaded your first photo', '/badges/first-snap.svg', 'fotografie', 1, now()),
  ('good-foodie', 'Guter Foodie', 'Good Foodie', 'Mehr als 5 Bewertungen abgegeben', 'Submitted more than 5 ratings', '/badges/good-foodie.svg', 'bewertungen', 2, now()),
  ('local-explorer', 'Lokaler Entdecker', 'Local Explorer', 'Mehr als 3 Bezirke besucht', 'Visited more than 3 districts', '/badges/local-explorer.svg', 'erkundung', 2, now()),
  ('schnitzel-lover', 'Schnitzel-Liebhaber', 'Schnitzel Lover', '5 verschiedene Schnitzel probiert', 'Tried 5 different schnitzels', '/badges/schnitzel-lover.svg', 'gerichte', 3, now()),
  ('dessert-expert', 'Dessert-Experte', 'Dessert Expert', '10 verschiedene Nachspeisen bewertet', 'Rated 10 different desserts', '/badges/dessert-expert.svg', 'gerichte', 4, now())
ON CONFLICT (id) DO NOTHING;