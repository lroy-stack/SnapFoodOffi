/*
  # Add badge definitions

  1. New Records
    - Adds all badge definitions to the `abzeichen_definitionen` table
    - Includes badges for all five categories: photography, comments, ratings, exploration, and specific dishes
  
  2. Changes
    - Uses ON CONFLICT clause to prevent duplicate entries
    - Each badge has German and English names and descriptions

  The badges are organized in categories with appropriate required levels for progression.
*/

-- Insert all badge definitions with conflict handling to avoid duplicates
INSERT INTO "public"."abzeichen_definitionen" 
  ("id", "name_de", "name_en", "beschreibung_de", "beschreibung_en", "icon_url", "kategorie", "level_erforderlich", "erstellt_am") 
VALUES 
  -- Photography badges (Fotografie-Abzeichen)
  ('first-photo', 'Erster Schnappschuss', 'First Snap', 'Dein erstes Foto hochgeladen', 'Uploaded your first photo', '/badges/first-snap.svg', 'fotografie', 1, now()),
  ('food-photographer', 'Food Fotograf', 'Food Photographer', '5 Fotos hochgeladen', 'Uploaded 5 photos', '/badges/food-photographer.svg', 'fotografie', 1, now()),
  ('visual-storyteller', 'Visueller Geschichtenerzähler', 'Visual Storyteller', '15 Fotos hochgeladen', 'Uploaded 15 photos', '/badges/visual-storyteller.svg', 'fotografie', 2, now()),
  ('photo-maestro', 'Foto-Maestro', 'Photo Maestro', '30 Fotos hochgeladen', 'Uploaded 30 photos', '/badges/photo-maestro.svg', 'fotografie', 3, now()),
  ('visual-legend', 'Visuelle Legende', 'Visual Legend', '50 Fotos hochgeladen', 'Uploaded 50 photos', '/badges/visual-legend.svg', 'fotografie', 4, now()),
  
  -- Comment badges (Kommentar-Abzeichen)
  ('first-word', 'Erstes Wort', 'First Word', 'Deinen ersten Kommentar geschrieben', 'Wrote your first comment', '/badges/first-word.svg', 'kommentare', 1, now()),
  ('chatty-foodie', 'Gesprächiger Foodie', 'Chatty Foodie', '6 Kommentare geschrieben', 'Wrote 6 comments', '/badges/chatty-foodie.svg', 'kommentare', 1, now()),
  ('food-critic', 'Food Kritiker', 'Food Critic', '15 Kommentare geschrieben', 'Wrote 15 comments', '/badges/food-critic.svg', 'kommentare', 2, now()),
  ('review-master', 'Review-Meister', 'Review Master', '50 Kommentare geschrieben', 'Wrote 50 comments', '/badges/review-master.svg', 'kommentare', 3, now()),
  ('eloquent-gourmet', 'Eloquenter Gourmet', 'Eloquent Gourmet', '100 Kommentare geschrieben', 'Wrote 100 comments', '/badges/eloquent-gourmet.svg', 'kommentare', 4, now()),
  
  -- Rating badges (Bewertungs-Abzeichen)
  ('first-rating', 'Erste Bewertung', 'First Rating', 'Deine erste Bewertung abgegeben', 'Submitted your first rating', '/badges/first-rating.svg', 'bewertungen', 1, now()),
  ('star-giver', 'Stern-Geber', 'Star Giver', '10 Bewertungen abgegeben', 'Submitted 10 ratings', '/badges/star-giver.svg', 'bewertungen', 2, now()),
  ('discerning-palate', 'Anspruchsvoller Gaumen', 'Discerning Palate', '25 Bewertungen abgegeben', 'Submitted 25 ratings', '/badges/discerning-palate.svg', 'bewertungen', 3, now()),
  ('rating-expert', 'Bewertungs-Experte', 'Rating Expert', '50 Bewertungen abgegeben', 'Submitted 50 ratings', '/badges/rating-expert.svg', 'bewertungen', 4, now()),
  ('star-collector', 'Stern-Sammler', 'Star Collector', '100 Bewertungen abgegeben', 'Submitted 100 ratings', '/badges/star-collector.svg', 'bewertungen', 5, now()),
  
  -- Exploration badges (Erkundungs-Abzeichen)
  ('first-discovery', 'Erste Entdeckung', 'First Discovery', 'Dein erstes besuchtes Restaurant', 'Visited your first restaurant', '/badges/first-discovery.svg', 'erkundung', 1, now()),
  ('local-explorer', 'Lokaler Entdecker', 'Local Explorer', '5 Restaurants besucht', 'Visited 5 restaurants', '/badges/local-explorer.svg', 'erkundung', 1, now()),
  ('district-traveler', 'Bezirks-Reisender', 'District Traveler', 'Restaurants in 3 Bezirken besucht', 'Visited restaurants in 3 districts', '/badges/district-traveler.svg', 'erkundung', 2, now()),
  ('city-navigator', 'Stadt-Navigator', 'City Navigator', 'Restaurants in 10 Bezirken besucht', 'Visited restaurants in 10 districts', '/badges/city-navigator.svg', 'erkundung', 3, now()),
  ('urban-legend', 'Urbane Legende', 'Urban Legend', '30 Restaurants besucht', 'Visited 30 restaurants', '/badges/urban-legend.svg', 'erkundung', 4, now()),
  
  -- Specific dish badges (Spezifische Gerichte-Abzeichen)
  ('schnitzel-lover', 'Schnitzel-Liebhaber', 'Schnitzel Lover', '3 verschiedene Schnitzel bewertet', 'Rated 3 different schnitzels', '/badges/schnitzel-lover.svg', 'gerichte', 2, now()),
  ('sweet-tooth', 'Naschkatze', 'Sweet Tooth', '5 Wiener Desserts bewertet', 'Rated 5 Viennese desserts', '/badges/sweet-tooth.svg', 'gerichte', 2, now()),
  ('coffee-connoisseur', 'Kaffee-Kenner', 'Coffee Connoisseur', '3 Wiener Kaffees bewertet', 'Rated 3 Viennese coffees', '/badges/coffee-connoisseur.svg', 'gerichte', 2, now()),
  ('goulash-guru', 'Gulasch-Guru', 'Goulash Guru', '3 Gulaschgerichte bewertet', 'Rated 3 goulash dishes', '/badges/goulash-guru.svg', 'gerichte', 3, now()),
  ('complete-menu', 'Komplettes Menü', 'Complete Menu', '1 Gericht aus jeder Kategorie bewertet', 'Rated 1 dish from each category', '/badges/complete-menu.svg', 'gerichte', 3, now())
ON CONFLICT (id) DO NOTHING;