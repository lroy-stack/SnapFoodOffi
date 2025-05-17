/*
  # Add Traditional Viennese Dishes

  1. Updates
    - Adds 'snack' as a valid category to gerichte_kategorie_check constraint
    - Inserts 30 traditional Viennese dishes into the gerichte table
  
  2. New Data
    - Adds main dishes (hauptgericht): Wiener Schnitzel, Tafelspitz, Wiener Gulasch, etc.
    - Adds desserts (nachspeise): Sachertorte, Apfelstrudel, Kaiserschmarrn, etc.
    - Adds drinks (getränk): Einspänner, Melange
*/

-- First, modify the constraint to allow 'snack' category
ALTER TABLE gerichte DROP CONSTRAINT IF EXISTS gerichte_kategorie_check;
ALTER TABLE gerichte ADD CONSTRAINT gerichte_kategorie_check 
  CHECK (kategorie = ANY (ARRAY['hauptgericht'::text, 'nachspeise'::text, 'vorspeise'::text, 'getränk'::text, 'snack'::text]));

-- Insert 30 traditional Viennese dishes
INSERT INTO gerichte (name_de, name_en, beschreibung_de, beschreibung_en, kategorie, bild_url)
VALUES
  -- 1
  ('Wiener Schnitzel', 'Viennese Schnitzel', 
   'Paniertes Kalbsschnitzel, traditionell mit Kartoffelsalat oder Petersilienkartoffeln serviert. Das wichtigste Merkmal ist die lockere, luftige Panade, die vom Fleisch absteht.', 
   'Breaded veal cutlet, traditionally served with potato salad or parsley potatoes. The most important feature is the loose, airy breading that stands away from the meat.',
   'hauptgericht', 
   'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg'),

  -- 2
  ('Tafelspitz', 'Boiled Beef', 
   'Gekochtes Rindfleisch aus der Schwanzkeule, serviert mit Apfelkren (Meerrettich), Schnittlauchsauce und Rösterdäpfeln. Ein Leibgericht von Kaiser Franz Joseph I.', 
   'Boiled beef from the cap of rump, served with apple horseradish, chive sauce, and roasted potatoes. A favorite dish of Emperor Franz Joseph I.',
   'hauptgericht', 
   'https://images.pexels.com/photos/6542708/pexels-photo-6542708.jpeg'),

  -- 3
  ('Kaiserschmarrn', 'Emperor''s Mess', 
   'Zerrissener Pfannkuchen mit Rosinen, bestäubt mit Puderzucker und serviert mit Zwetschkenröster oder Apfelmus. Der Legende nach für Kaiser Franz Joseph I. kreiert.', 
   'Shredded pancake with raisins, dusted with powdered sugar and served with plum compote or applesauce. According to legend, created for Emperor Franz Joseph I.',
   'nachspeise', 
   'https://images.pexels.com/photos/15124696/pexels-photo-15124696.jpeg'),

  -- 4
  ('Sachertorte', 'Sacher Cake', 
   'Berühmte Schokoladentorte mit Marillenmarmelade und Schokoladenglasur, kreiert von Franz Sacher im Jahr 1832 für Fürst Metternich.', 
   'Famous chocolate cake with apricot jam and chocolate glaze, created by Franz Sacher in 1832 for Prince Metternich.',
   'nachspeise', 
   'https://images.pexels.com/photos/11788022/pexels-photo-11788022.jpeg'),

  -- 5
  ('Apfelstrudel', 'Apple Strudel', 
   'Dünner, elastischer Teig gefüllt mit geriebenen Äpfeln, Zucker, Zimt, Rosinen und Brotkrumen. Ein emblematisches Dessert der Wiener Küche.', 
   'Thin, elastic dough filled with grated apples, sugar, cinnamon, raisins, and breadcrumbs. An emblematic dessert of Viennese cuisine.',
   'nachspeise', 
   'https://images.pexels.com/photos/14705135/pexels-photo-14705135.jpeg'),

  -- 6
  ('Wiener Gulasch', 'Viennese Goulash', 
   'Würziges Rindfleischeintopf mit Paprika, Zwiebeln und Kümmel, oft mit Semmelknödeln oder Nockerln serviert. Stammt ursprünglich aus Ungarn, wurde jedoch in Wien adaptiert.', 
   'Spicy beef stew with paprika, onions, and caraway seeds, often served with bread dumplings or small dumplings. Originally from Hungary, but adapted in Vienna.',
   'hauptgericht', 
   'https://images.pexels.com/photos/6542709/pexels-photo-6542709.jpeg'),

  -- 7
  ('Wiener Würstel', 'Vienna Sausages', 
   'Dünne Brühwurst, meist paarweise serviert mit Senf, Kren und einer Scheibe Brot. Ein klassischer Snack an Wiener Würstelständen.', 
   'Thin boiled sausages, usually served in pairs with mustard, horseradish, and a slice of bread. A classic snack at Viennese sausage stands.',
   'hauptgericht', 
   'https://images.pexels.com/photos/5774154/pexels-photo-5774154.jpeg'),

  -- 8
  ('Palatschinken', 'Austrian Crepes', 
   'Dünne Pfannkuchen, oft mit Marmelade, Nüssen oder Topfen gefüllt. Eine beliebte Nachspeise, die auch als Hauptgericht serviert werden kann.', 
   'Thin pancakes, often filled with jam, nuts, or quark cheese. A popular dessert that can also be served as a main dish.',
   'nachspeise', 
   'https://images.pexels.com/photos/14510065/pexels-photo-14510065.jpeg'),

  -- 9
  ('Semmelknödel', 'Bread Dumplings', 
   'Knödel aus altbackenen Semmeln, Milch, Eiern und Petersilie, oft als Beilage zu Gulasch oder Braten serviert. Ein klassisches Beispiel für die Resteverwertung in der Wiener Küche.', 
   'Dumplings made from stale bread rolls, milk, eggs, and parsley, often served as a side dish with goulash or roasts. A classic example of leftover usage in Viennese cuisine.',
   'hauptgericht', 
   'https://images.pexels.com/photos/15635813/pexels-photo-15635813.jpeg'),

  -- 10
  ('Vanillekipferl', 'Vanilla Crescents', 
   'Halbmondförmige Kekse aus Mürbteig mit gemahlenen Mandeln oder Nüssen, bestäubt mit Vanillezucker. Ein traditionelles Weihnachtsgebäck.', 
   'Crescent-shaped cookies made from shortcrust pastry with ground almonds or nuts, dusted with vanilla sugar. A traditional Christmas cookie.',
   'nachspeise', 
   'https://images.pexels.com/photos/6138012/pexels-photo-6138012.jpeg'),

  -- 11
  ('Powidltascherl', 'Plum Jam Pockets', 
   'Teigtaschen gefüllt mit Powidl (Zwetschgenmus), oft mit Mohn oder Nüssen bestreut. Eine traditionelle süße Speise aus der altösterreichischen Küche.', 
   'Pastry pockets filled with Powidl (plum jam), often sprinkled with poppy seeds or nuts. A traditional sweet dish from old Austrian cuisine.',
   'nachspeise', 
   'https://images.pexels.com/photos/4040698/pexels-photo-4040698.jpeg'),

  -- 12
  ('Wiener Backhendl', 'Viennese Fried Chicken', 
   'Paniertes Hühnchen, traditionell mit Erdäpfel-Vogerlsalat serviert. Ein Klassiker der Wiener Küche, der im 18. Jahrhundert populär wurde.', 
   'Breaded chicken, traditionally served with potato and lamb''s lettuce salad. A classic of Viennese cuisine that became popular in the 18th century.',
   'hauptgericht', 
   'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg'),

  -- 13
  ('Zwiebelrostbraten', 'Roast Beef with Onions', 
   'Gebratenes Rindersteak mit karamellisierten Zwiebeln, Bratensaft und gelegentlich Speck. Oft mit Bratkartoffeln oder Erdäpfelpüree serviert.', 
   'Roasted beef steak with caramelized onions, gravy, and occasionally bacon. Often served with fried potatoes or mashed potatoes.',
   'hauptgericht', 
   'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg'),

  -- 14
  ('Beuschel', 'Veal Lights', 
   'Ragout aus Kalbslunge und -herz, gewürzt und in einer sauren Rahmsauce gekocht. Ein traditionelles Gericht, das die österreichische Innereienküche repräsentiert.', 
   'Ragout of veal lungs and heart, seasoned and cooked in a sour cream sauce. A traditional dish representing Austrian offal cuisine.',
   'hauptgericht', 
   'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg'),

  -- 15
  ('Topfenstrudel', 'Quark Strudel', 
   'Strudel gefüllt mit Topfen (Quark), Rosinen und Vanillearoma. Eine beliebte Variante des klassischen Strudels, oft mit Vanillesauce serviert.', 
   'Strudel filled with quark cheese, raisins, and vanilla flavor. A popular variant of the classic strudel, often served with vanilla sauce.',
   'nachspeise', 
   'https://images.pexels.com/photos/14039992/pexels-photo-14039992.jpeg'),

  -- 16
  ('Marillenknödel', 'Apricot Dumplings', 
   'Knödel aus Topfen- oder Kartoffelteig, gefüllt mit ganzen Marillen und einem Stück Würfelzucker. In Brösel gewälzt und mit Puderzucker serviert.', 
   'Dumplings made from quark or potato dough, filled with whole apricots and a piece of sugar cube. Rolled in breadcrumbs and served with powdered sugar.',
   'nachspeise', 
   'https://images.pexels.com/photos/4430316/pexels-photo-4430316.jpeg'),

  -- 17
  ('Leberkäse', 'Liver Cheese', 
   'Gebackene Fleischpastete aus fein zerkleinerten Zutaten, trotz des Namens üblicherweise ohne Leber. Oft in Semmel als Snack oder mit Spiegelei als Hauptgericht serviert.', 
   'Baked meat loaf made from finely minced ingredients, despite the name usually without liver. Often served in a roll as a snack or with fried egg as a main dish.',
   'hauptgericht', 
   'https://images.pexels.com/photos/812868/pexels-photo-812868.jpeg'),

  -- 18
  ('Esterházy-Torte', 'Esterházy Cake', 
   'Schichttorte aus Haselnuss-Biskuit mit Buttercreme, verziert mit charakteristischem Muster aus Fondant. Benannt nach dem ungarischen Fürsten Paul III Anton Esterházy.', 
   'Layered cake made of hazelnut biscuit with buttercream, decorated with a characteristic pattern of fondant. Named after the Hungarian Prince Paul III Anton Esterházy.',
   'nachspeise', 
   'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg'),

  -- 19
  ('Wiener Erdäpfelsalat', 'Viennese Potato Salad', 
   'Kartoffelsalat mit Zwiebeln, Essig, Öl, Brühe und Senf, ohne Mayonnaise. Die perfekte Beilage zum Wiener Schnitzel.', 
   'Potato salad with onions, vinegar, oil, broth, and mustard, without mayonnaise. The perfect side dish for Wiener Schnitzel.',
   'hauptgericht', 
   'https://images.pexels.com/photos/5718217/pexels-photo-5718217.jpeg'),

  -- 20
  ('Buchteln', 'Sweet Yeast Buns', 
   'Süße Hefeteigbällchen, oft mit Powidl (Zwetschgenmus) gefüllt und in einer Form dicht aneinander gebacken. Warm mit Vanillesauce serviert.', 
   'Sweet yeast dough buns, often filled with plum jam and baked closely together in a form. Served warm with vanilla sauce.',
   'nachspeise', 
   'https://images.pexels.com/photos/6134234/pexels-photo-6134234.jpeg'),

  -- 21
  ('Linzer Torte', 'Linzer Cake', 
   'Eine der ältesten Torten der Welt, bestehend aus Mürbteig mit gemahlenen Nüssen und Gewürzen, gefüllt mit Johannisbeergelee und einem charakteristischen Gittermuster.', 
   'One of the oldest cakes in the world, consisting of shortcrust pastry with ground nuts and spices, filled with redcurrant jelly and having a characteristic lattice pattern.',
   'nachspeise', 
   'https://images.pexels.com/photos/7474208/pexels-photo-7474208.jpeg'),

  -- 22
  ('Grießnockerl', 'Semolina Dumplings', 
   'Kleine, leichte Nockerl aus Grieß, Eiern und Butter, typischerweise in klarer Rindssuppe serviert. Eine klassische Suppeneinlage der Wiener Küche.', 
   'Small, light dumplings made from semolina, eggs, and butter, typically served in clear beef soup. A classic soup garnish in Viennese cuisine.',
   'hauptgericht', 
   'https://images.pexels.com/photos/15439991/pexels-photo-15439991.jpeg'),

  -- 23
  ('Salzburger Nockerl', 'Salzburg Soufflé', 
   'Luftiges, süßes Soufflé, das die Silhouette der Salzburger Berge nachahmen soll. Mit Puderzucker bestäubt und sofort nach dem Backen serviert.', 
   'Airy, sweet soufflé meant to imitate the silhouette of the Salzburg mountains. Dusted with powdered sugar and served immediately after baking.',
   'nachspeise', 
   'https://images.pexels.com/photos/9401081/pexels-photo-9401081.jpeg'),

  -- 24
  ('Punschkrapfen', 'Punch Cake', 
   'Kleine, rosa glasierte Kuchenwürfel mit Rum-Aroma, gefüllt mit Marmelade und Marzipan. Ein emblematisches Gebäck der Wiener Kaffeehauskultur.', 
   'Small, pink glazed cake cubes with rum flavor, filled with jam and marzipan. An emblematic pastry of Viennese coffee house culture.',
   'nachspeise', 
   'https://images.pexels.com/photos/7506777/pexels-photo-7506777.jpeg'),

  -- 25
  ('Kärntner Kasnudeln', 'Carinthian Cheese Noodles', 
   'Teigtaschen gefüllt mit Topfen und Minze, traditionell mit brauner Butter und Brösel serviert. Ursprünglich aus Kärnten, aber auch in Wien beliebt.', 
   'Pasta pockets filled with quark cheese and mint, traditionally served with brown butter and breadcrumbs. Originally from Carinthia, but also popular in Vienna.',
   'hauptgericht', 
   'https://images.pexels.com/photos/6248997/pexels-photo-6248997.jpeg'),

  -- 26
  ('Faschierte Laibchen', 'Meat Patties', 
   'Flache Frikadellen aus Hackfleisch, Zwiebeln, Knoblauch und Gewürzen, oft mit Kartoffelpüree oder Kartoffelsalat serviert. Ein bodenständiges Alltagsgericht.', 
   'Flat meat patties made from ground meat, onions, garlic, and spices, often served with mashed potatoes or potato salad. A down-to-earth everyday dish.',
   'hauptgericht', 
   'https://images.pexels.com/photos/6941042/pexels-photo-6941042.jpeg'),

  -- 27
  ('Einspänner', 'Single Horse Carriage Coffee', 
   'Starker schwarzer Kaffee mit einem Häubchen aus geschlagenem Rahm, serviert im Glas. Benannt nach den Einspänner-Kutschen, deren Fahrer diesen Kaffee tranken.', 
   'Strong black coffee with a dollop of whipped cream, served in a glass. Named after the single-horse carriages whose drivers drank this coffee.',
   'getränk', 
   'https://images.pexels.com/photos/4051213/pexels-photo-4051213.jpeg'),

  -- 28
  ('Melange', 'Viennese Melange', 
   'Wiener Kaffee ähnlich dem Cappuccino, bestehend aus einem Espresso mit heißer Milch und Milchschaum. Ein Grundpfeiler der Wiener Kaffeehauskultur.', 
   'Viennese coffee similar to cappuccino, consisting of an espresso with hot milk and milk foam. A cornerstone of Viennese coffee house culture.',
   'getränk', 
   'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg'),

  -- 29
  ('Malakoff-Torte', 'Malakoff Cake', 
   'Biskuittorte mit Buttercreme und Rum, benannt nach der Schlacht von Malakoff im Krimkrieg. Ein weiteres Beispiel für die reiche Tortenkultur Wiens.', 
   'Sponge cake with buttercream and rum, named after the Battle of Malakoff in the Crimean War. Another example of Vienna''s rich cake culture.',
   'nachspeise', 
   'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'),

  -- 30
  ('Mohr im Hemd', 'Chocolate Pudding', 
   'Warmer Schokoladenkuchen mit flüssigem Kern, serviert mit Schlagobers (Schlagsahne). Ein traditionelles Dessert der Wiener Kaffeehäuser.', 
   'Warm chocolate cake with a liquid center, served with whipped cream. A traditional dessert of Viennese coffee houses.',
   'nachspeise', 
   'https://images.pexels.com/photos/6133203/pexels-photo-6133203.jpeg');