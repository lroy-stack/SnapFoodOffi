/*
  # Add Viennese restaurants and dish connections

  1. New Data
    - Insert 20 traditional Viennese restaurants with details
    - Create connections between restaurants and dishes in gericht_restaurant table
  
  2. Changes
    - Populate restaurants table with authentic Viennese establishments
    - Link dishes to restaurants with pricing information
*/

-- Insert the Viennese restaurants
INSERT INTO restaurants (
  name,
  adresse,
  bezirk,
  koordinaten,
  kontaktdaten,
  preisklasse
) VALUES
-- 1. Figlmüller
(
  'Figlmüller',
  'Wollzeile 5, 1010 Wien',
  '1',
  point(48.2081, 16.3748),
  jsonb_build_object(
    'telefon', '+43 1 512 61 77',
    'website', 'https://www.figlmueller.at'
  ),
  3
),
-- 2. Plachutta
(
  'Plachutta',
  'Wollzeile 38, 1010 Wien',
  '1',
  point(48.2091, 16.3786),
  jsonb_build_object(
    'telefon', '+43 1 512 15 77',
    'website', 'https://www.plachutta.at'
  ),
  3
),
-- 3. Café Sacher Wien
(
  'Café Sacher Wien',
  'Philharmoniker Str. 4, 1010 Wien',
  '1',
  point(48.2038, 16.3686),
  jsonb_build_object(
    'telefon', '+43 1 514 56',
    'website', 'https://www.sacher.com'
  ),
  3
),
-- 4. Café Central
(
  'Café Central',
  'Herrengasse 14, 1010 Wien',
  '1',
  point(48.2099, 16.3667),
  jsonb_build_object(
    'telefon', '+43 1 533 37 63 24',
    'website', 'https://www.cafecentral.wien'
  ),
  3
),
-- 5. Zum Schwarzen Kameel
(
  'Zum Schwarzen Kameel',
  'Bognergasse 5, 1010 Wien',
  '1',
  point(48.2111, 16.3681),
  jsonb_build_object(
    'telefon', '+43 1 533 81 25',
    'website', 'https://www.kameel.at'
  ),
  3
),
-- 6. Café Landtmann
(
  'Café Landtmann',
  'Universitätsring 4, 1010 Wien',
  '1',
  point(48.2135, 16.3614),
  jsonb_build_object(
    'telefon', '+43 1 24 100 120',
    'website', 'https://www.landtmann.at'
  ),
  3
),
-- 7. Gasthaus Pöschl
(
  'Gasthaus Pöschl',
  'Weihburggasse 17, 1010 Wien',
  '1',
  point(48.2068, 16.3739),
  jsonb_build_object(
    'telefon', '+43 1 513 52 82',
    'website', 'https://gasthauspöschl.at'
  ),
  3
),
-- 8. Trzesniewski
(
  'Trzesniewski',
  'Dorotheergasse 1, 1010 Wien',
  '1',
  point(48.2079, 16.3698),
  jsonb_build_object(
    'telefon', '+43 1 512 32 91',
    'website', 'https://www.trzesniewski.at'
  ),
  2
),
-- 9. Café Demel
(
  'Café Demel',
  'Kohlmarkt 14, 1010 Wien',
  '1',
  point(48.2089, 16.3671),
  jsonb_build_object(
    'telefon', '+43 1 535 17 17',
    'website', 'https://www.demel.com'
  ),
  3
),
-- 10. Meierei im Stadtpark
(
  'Meierei im Stadtpark',
  'Stadtpark 1, 1010 Wien',
  '1',
  point(48.2047, 16.3794),
  jsonb_build_object(
    'telefon', '+43 1 713 31 68',
    'website', 'https://www.steirereck.at/meierei'
  ),
  3
),
-- 11. Café Hawelka
(
  'Café Hawelka',
  'Dorotheergasse 6, 1010 Wien',
  '1',
  point(48.2084, 16.3702),
  jsonb_build_object(
    'telefon', '+43 1 512 82 30',
    'website', 'https://www.hawelka.at'
  ),
  2
),
-- 12. Restaurant Steirereck
(
  'Restaurant Steirereck',
  'Stadtpark, Am Heumarkt 2A, 1030 Wien',
  '3',
  point(48.2042, 16.3803),
  jsonb_build_object(
    'telefon', '+43 1 713 31 68',
    'website', 'https://www.steirereck.at'
  ),
  3
),
-- 13. Griechenbeisl
(
  'Griechenbeisl',
  'Fleischmarkt 11, 1010 Wien',
  '1',
  point(48.2105, 16.3764),
  jsonb_build_object(
    'telefon', '+43 1 533 19 77',
    'website', 'https://www.griechenbeisl.at'
  ),
  3
),
-- 14. Bitzinger Würstelstand
(
  'Bitzinger Würstelstand',
  'Albertinaplatz, 1010 Wien',
  '1',
  point(48.2032, 16.3686),
  jsonb_build_object(
    'telefon', '+43 1 533 10 26',
    'website', 'https://www.bitzinger.at'
  ),
  1
),
-- 15. Café Diglas
(
  'Café Diglas',
  'Wollzeile 10, 1010 Wien',
  '1',
  point(48.2085, 16.3751),
  jsonb_build_object(
    'telefon', '+43 1 512 57 65',
    'website', 'https://www.diglas.at'
  ),
  2
),
-- 16. Gasthaus Ubl
(
  'Gasthaus Ubl',
  'Pressgasse 26, 1040 Wien',
  '4',
  point(48.1935, 16.3561),
  jsonb_build_object(
    'telefon', '+43 1 587 65 79',
    'website', ''
  ),
  2
),
-- 17. Gmoakeller
(
  'Gmoakeller',
  'Am Heumarkt 25, 1030 Wien',
  '3',
  point(48.2033, 16.3795),
  jsonb_build_object(
    'telefon', '+43 1 712 53 10',
    'website', 'https://www.gmoakeller.at'
  ),
  3
),
-- 18. Café Prückel
(
  'Café Prückel',
  'Stubenring 24, 1010 Wien',
  '1',
  point(48.2081, 16.3812),
  jsonb_build_object(
    'telefon', '+43 1 512 61 15',
    'website', 'https://www.prueckel.at'
  ),
  2
),
-- 19. Café Mozart
(
  'Café Mozart',
  'Albertinaplatz 2, 1010 Wien',
  '1',
  point(48.2035, 16.3692),
  jsonb_build_object(
    'telefon', '+43 1 24 100 200',
    'website', 'https://www.cafe-mozart.at'
  ),
  3
),
-- 20. Gasthaus Reinthaler
(
  'Gasthaus Reinthaler',
  'Glockengasse 4, 1020 Wien',
  '2',
  point(48.2159, 16.3763),
  jsonb_build_object(
    'telefon', '+43 1 276 25 16',
    'website', 'https://www.gasthaus-reinthaler.at'
  ),
  2
);

-- Now let's connect dishes to restaurants through the gericht_restaurant table
-- First, we'll get dish IDs from the gerichte table
WITH dish_ids AS (
  SELECT id, name_de FROM gerichte
)
INSERT INTO gericht_restaurant (
  gericht_id,
  restaurant_id,
  verfügbar,
  preis
)
-- Figlmüller
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 24.50
    WHEN 'Wiener Erdäpfelsalat' THEN 6.90
    WHEN 'Apfelstrudel' THEN 8.50
    ELSE 15.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Figlmüller'
AND d.name_de IN ('Wiener Schnitzel', 'Wiener Erdäpfelsalat', 'Apfelstrudel')

UNION ALL

-- Plachutta
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Tafelspitz' THEN 29.80
    WHEN 'Wiener Gulasch' THEN 18.90
    WHEN 'Semmelknödel' THEN 7.50
    ELSE 15.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Plachutta'
AND d.name_de IN ('Tafelspitz', 'Wiener Gulasch', 'Semmelknödel')

UNION ALL

-- Café Sacher Wien
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Sachertorte' THEN 8.50
    WHEN 'Einspänner' THEN 6.20
    WHEN 'Melange' THEN 5.90
    ELSE 7.50
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Sacher Wien'
AND d.name_de IN ('Sachertorte', 'Einspänner', 'Melange')

UNION ALL

-- Café Central
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Melange' THEN 5.80
    WHEN 'Kaiserschmarrn' THEN 12.90
    WHEN 'Apfelstrudel' THEN 7.50
    ELSE 8.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Central'
AND d.name_de IN ('Melange', 'Kaiserschmarrn', 'Apfelstrudel')

UNION ALL

-- Zum Schwarzen Kameel
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Tafelspitz' THEN 28.90
    WHEN 'Wiener Schnitzel' THEN 26.50
    ELSE 15.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Zum Schwarzen Kameel'
AND d.name_de IN ('Tafelspitz', 'Wiener Schnitzel')

UNION ALL

-- Café Landtmann
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Melange' THEN 5.90
    WHEN 'Kaiserschmarrn' THEN 13.50
    WHEN 'Apfelstrudel' THEN 7.90
    ELSE 9.50
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Landtmann'
AND d.name_de IN ('Melange', 'Kaiserschmarrn', 'Apfelstrudel')

UNION ALL

-- Gasthaus Pöschl
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 22.90
    WHEN 'Zwiebelrostbraten' THEN 24.50
    WHEN 'Wiener Gulasch' THEN 16.90
    ELSE 15.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Gasthaus Pöschl'
AND d.name_de IN ('Wiener Schnitzel', 'Zwiebelrostbraten', 'Wiener Gulasch')

UNION ALL

-- Trzesniewski
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Leberkäse' THEN 4.90
    ELSE 3.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Trzesniewski'
AND d.name_de IN ('Leberkäse')

UNION ALL

-- Café Demel
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Sachertorte' THEN 8.20
    WHEN 'Apfelstrudel' THEN 7.50
    WHEN 'Punschkrapfen' THEN 4.90
    WHEN 'Melange' THEN 5.70
    ELSE 6.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Demel'
AND d.name_de IN ('Sachertorte', 'Apfelstrudel', 'Punschkrapfen', 'Melange')

UNION ALL

-- Meierei im Stadtpark
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 28.90
    WHEN 'Tafelspitz' THEN 32.50
    ELSE 18.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Meierei im Stadtpark'
AND d.name_de IN ('Wiener Schnitzel', 'Tafelspitz')

UNION ALL

-- Café Hawelka
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Melange' THEN 5.50
    WHEN 'Buchteln' THEN 7.90
    ELSE 6.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Hawelka'
AND d.name_de IN ('Melange', 'Buchteln')

UNION ALL

-- Restaurant Steirereck
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Tafelspitz' THEN 36.00
    WHEN 'Wiener Schnitzel' THEN 34.00
    ELSE 28.00
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Restaurant Steirereck'
AND d.name_de IN ('Tafelspitz', 'Wiener Schnitzel')

UNION ALL

-- Griechenbeisl
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 23.50
    WHEN 'Tafelspitz' THEN 25.80
    WHEN 'Apfelstrudel' THEN 7.90
    ELSE 15.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Griechenbeisl'
AND d.name_de IN ('Wiener Schnitzel', 'Tafelspitz', 'Apfelstrudel')

UNION ALL

-- Bitzinger Würstelstand
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Würstel' THEN 6.90
    WHEN 'Leberkäse' THEN 5.90
    ELSE 5.50
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Bitzinger Würstelstand'
AND d.name_de IN ('Wiener Würstel', 'Leberkäse')

UNION ALL

-- Café Diglas
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Apfelstrudel' THEN 6.90
    WHEN 'Sachertorte' THEN 7.50
    WHEN 'Melange' THEN 5.60
    ELSE 6.50
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Diglas'
AND d.name_de IN ('Apfelstrudel', 'Sachertorte', 'Melange')

UNION ALL

-- Gasthaus Ubl
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 18.90
    WHEN 'Zwiebelrostbraten' THEN 21.50
    WHEN 'Semmelknödel' THEN 6.90
    ELSE 12.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Gasthaus Ubl'
AND d.name_de IN ('Wiener Schnitzel', 'Zwiebelrostbraten', 'Semmelknödel')

UNION ALL

-- Gmoakeller
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 21.90
    WHEN 'Tafelspitz' THEN 23.80
    WHEN 'Wiener Gulasch' THEN 15.90
    ELSE 14.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Gmoakeller'
AND d.name_de IN ('Wiener Schnitzel', 'Tafelspitz', 'Wiener Gulasch')

UNION ALL

-- Café Prückel
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Melange' THEN 5.20
    WHEN 'Apfelstrudel' THEN 6.50
    WHEN 'Sachertorte' THEN 7.20
    ELSE 6.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Prückel'
AND d.name_de IN ('Melange', 'Apfelstrudel', 'Sachertorte')

UNION ALL

-- Café Mozart
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Melange' THEN 5.70
    WHEN 'Sachertorte' THEN 8.10
    WHEN 'Apfelstrudel' THEN 7.20
    ELSE 7.50
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Café Mozart'
AND d.name_de IN ('Melange', 'Sachertorte', 'Apfelstrudel')

UNION ALL

-- Gasthaus Reinthaler
SELECT
  d.id,
  r.id,
  TRUE,
  CASE d.name_de
    WHEN 'Wiener Schnitzel' THEN 16.90
    WHEN 'Wiener Gulasch' THEN 13.90
    WHEN 'Semmelknödel' THEN 5.90
    ELSE 10.90
  END
FROM restaurants r, dish_ids d
WHERE r.name = 'Gasthaus Reinthaler'
AND d.name_de IN ('Wiener Schnitzel', 'Wiener Gulasch', 'Semmelknödel');