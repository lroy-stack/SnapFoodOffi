/*
  # Create dish-restaurant associations

  1. Setup
    - This migration establishes connections between dishes and restaurants
    - Creates entries in the gericht_restaurant table with proper references
  
  2. Details
    - Associates dishes with restaurants where they are served
    - Sets prices for each dish at specific restaurants
    - Adds availability information
*/

-- First, let's create a temporary table to store the dish-restaurant mapping information
CREATE TEMP TABLE temp_dish_restaurant_map (
  dish_name TEXT,
  restaurant_name TEXT, 
  price NUMERIC(10,2),
  rating NUMERIC(3,2)
);

-- Populate the temporary mapping table with all the dish-restaurant assignments
INSERT INTO temp_dish_restaurant_map (dish_name, restaurant_name, price, rating) VALUES
-- 1. Figlmüller
('Wiener Schnitzel', 'Figlmüller', 24.50, 5.0),
('Wiener Backhendl', 'Figlmüller', 22.90, 4.5),
('Wiener Erdäpfelsalat', 'Figlmüller', 6.90, 4.7),

-- 2. Plachutta
('Tafelspitz', 'Plachutta', 29.80, 5.0),
('Wiener Gulasch', 'Plachutta', 18.90, 4.6),
('Zwiebelrostbraten', 'Plachutta', 25.50, 4.8),

-- 3. Café Sacher Wien
('Sachertorte', 'Café Sacher Wien', 8.50, 5.0),
('Apfelstrudel', 'Café Sacher Wien', 7.90, 4.5),
('Kaiserschmarrn', 'Café Sacher Wien', 13.90, 4.6),
('Melange', 'Café Sacher Wien', 5.90, 4.8),

-- 4. Café Central
('Melange', 'Café Central', 5.80, 4.9),
('Apfelstrudel', 'Café Central', 7.50, 4.7),
('Sachertorte', 'Café Central', 8.20, 4.6),
('Punschkrapfen', 'Café Central', 4.80, 4.5),
('Einspänner', 'Café Central', 5.60, 4.8),

-- 5. Zum Schwarzen Kameel
('Zwiebelrostbraten', 'Zum Schwarzen Kameel', 27.90, 4.9),
('Tafelspitz', 'Zum Schwarzen Kameel', 28.90, 4.8),
('Wiener Schnitzel', 'Zum Schwarzen Kameel', 26.50, 4.7),

-- 6. Café Landtmann
('Sachertorte', 'Café Landtmann', 8.40, 4.7),
('Melange', 'Café Landtmann', 5.90, 4.9),
('Apfelstrudel', 'Café Landtmann', 7.90, 4.6),
('Topfenstrudel', 'Café Landtmann', 7.50, 4.5),
('Kaiserschmarrn', 'Café Landtmann', 13.50, 4.8),

-- 7. Gasthaus Pöschl
('Wiener Gulasch', 'Gasthaus Pöschl', 16.90, 4.9),
('Semmelknödel', 'Gasthaus Pöschl', 6.50, 4.6),
('Leberkäse', 'Gasthaus Pöschl', 9.90, 4.5),

-- 8. Trzesniewski
('Wiener Würstel', 'Trzesniewski', 4.90, 4.5),
('Leberkäse', 'Trzesniewski', 4.90, 4.5),

-- 9. Café Demel
('Sachertorte', 'Café Demel', 8.20, 4.9),
('Punschkrapfen', 'Café Demel', 4.90, 4.8),
('Vanillekipferl', 'Café Demel', 3.50, 4.7),
('Linzer Torte', 'Café Demel', 7.90, 4.6),

-- 10. Meierei im Stadtpark
('Kaiserschmarrn', 'Meierei im Stadtpark', 15.90, 5.0),
('Wiener Schnitzel', 'Meierei im Stadtpark', 28.90, 4.7),
('Apfelstrudel', 'Meierei im Stadtpark', 9.50, 4.8),

-- 11. Café Hawelka
('Buchteln', 'Café Hawelka', 7.90, 4.9),
('Melange', 'Café Hawelka', 5.50, 4.8),
('Einspänner', 'Café Hawelka', 5.20, 4.7),

-- 12. Restaurant Steirereck
('Tafelspitz', 'Restaurant Steirereck', 36.00, 5.0),
('Wiener Schnitzel', 'Restaurant Steirereck', 34.00, 4.9),

-- 13. Griechenbeisl
('Wiener Schnitzel', 'Griechenbeisl', 23.50, 4.7),
('Tafelspitz', 'Griechenbeisl', 25.80, 4.6),
('Wiener Backhendl', 'Griechenbeisl', 21.90, 4.8),
('Semmelknödel', 'Griechenbeisl', 6.90, 4.5),

-- 14. Bitzinger Würstelstand
('Wiener Würstel', 'Bitzinger Würstelstand', 6.90, 4.9),
('Leberkäse', 'Bitzinger Würstelstand', 5.90, 4.7),

-- 15. Café Diglas
('Apfelstrudel', 'Café Diglas', 6.90, 4.8),
('Sachertorte', 'Café Diglas', 7.50, 4.7),
('Kaiserschmarrn', 'Café Diglas', 12.90, 4.6),
('Melange', 'Café Diglas', 5.60, 4.5),

-- 16. Gasthaus Ubl
('Beuschel', 'Gasthaus Ubl', 16.50, 4.8),
('Faschierte Laibchen', 'Gasthaus Ubl', 14.90, 4.9),
('Wiener Gulasch', 'Gasthaus Ubl', 15.90, 4.7),
('Leberkäse', 'Gasthaus Ubl', 9.50, 4.6),

-- 17. Gmoakeller
('Wiener Schnitzel', 'Gmoakeller', 21.90, 4.8),
('Tafelspitz', 'Gmoakeller', 23.80, 4.7),
('Wiener Gulasch', 'Gmoakeller', 15.90, 4.6),
('Wiener Erdäpfelsalat', 'Gmoakeller', 5.90, 4.5),

-- 18. Café Prückel
('Melange', 'Café Prückel', 5.20, 4.8),
('Einspänner', 'Café Prückel', 5.50, 4.7),
('Sachertorte', 'Café Prückel', 7.20, 4.6),
('Apfelstrudel', 'Café Prückel', 6.50, 4.5),

-- 19. Café Mozart
('Sachertorte', 'Café Mozart', 8.10, 4.8),
('Esterházy-Torte', 'Café Mozart', 8.50, 4.9),
('Melange', 'Café Mozart', 5.70, 4.7),
('Apfelstrudel', 'Café Mozart', 7.20, 4.6),

-- 20. Gasthaus Reinthaler
('Wiener Schnitzel', 'Gasthaus Reinthaler', 16.90, 4.7),
('Wiener Gulasch', 'Gasthaus Reinthaler', 13.90, 4.6),
('Faschierte Laibchen', 'Gasthaus Reinthaler', 12.50, 4.5),
('Semmelknödel', 'Gasthaus Reinthaler', 5.90, 4.4);

-- Insert connections into gericht_restaurant table using the mapping table and actual IDs from database
INSERT INTO gericht_restaurant (
  gericht_id,
  restaurant_id,
  verfügbar,
  preis
)
SELECT 
  g.id AS gericht_id,
  r.id AS restaurant_id,
  true AS verfügbar,
  m.price AS preis
FROM 
  temp_dish_restaurant_map m
JOIN 
  gerichte g ON m.dish_name = g.name_de
JOIN 
  restaurants r ON m.restaurant_name = r.name
ON CONFLICT (gericht_id, restaurant_id) DO UPDATE
SET 
  preis = EXCLUDED.preis,
  verfügbar = EXCLUDED.verfügbar;

-- Clean up
DROP TABLE temp_dish_restaurant_map;