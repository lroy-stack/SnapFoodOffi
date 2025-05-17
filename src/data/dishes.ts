import { Dish } from '../types';

// Sample data for traditional Viennese dishes
export const dishes: Dish[] = [
  {
    id: 'wiener-schnitzel',
    nameDE: 'Wiener Schnitzel',
    nameEN: 'Viennese Schnitzel',
    descriptionDE: 'Dünnes, paniertes und gebratenes Kalbfleisch-Schnitzel. Ein Klassiker der Wiener Küche.',
    descriptionEN: 'Thin, breaded and fried veal cutlet. A classic of Viennese cuisine.',
    category: 'main',
    imageUrl: 'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    origin: 'Vienna',
    priceRange: 2,
    popularity: 98
  },
  {
    id: 'apfelstrudel',
    nameDE: 'Apfelstrudel',
    nameEN: 'Apple Strudel',
    descriptionDE: 'Traditioneller österreichischer Strudel mit Apfelfüllung, Zimt und Rosinen.',
    descriptionEN: 'Traditional Austrian strudel with apple filling, cinnamon, and raisins.',
    category: 'dessert',
    imageUrl: 'https://images.pexels.com/photos/14705135/pexels-photo-14705135.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    origin: 'Vienna',
    priceRange: 2,
    popularity: 86
  },
  {
    id: 'gulasch',
    nameDE: 'Wiener Gulasch',
    nameEN: 'Viennese Goulash',
    descriptionDE: 'Würziges Rindfleischeintopf mit Paprika und Zwiebeln, oft mit Knödeln oder Brot serviert.',
    descriptionEN: 'Spicy beef stew with paprika and onions, often served with dumplings or bread.',
    category: 'main',
    imageUrl: 'https://images.pexels.com/photos/6542709/pexels-photo-6542709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    origin: 'Vienna',
    priceRange: 2,
    popularity: 85
  },
  {
    id: 'sachertorte',
    nameDE: 'Sachertorte',
    nameEN: 'Sacher Cake',
    descriptionDE: 'Berühmte Wiener Schokoladentorte mit Marillenmarmelade und Schokoglasur.',
    descriptionEN: 'Famous Viennese chocolate cake with apricot jam and chocolate glaze.',
    category: 'dessert',
    imageUrl: 'https://images.pexels.com/photos/11788022/pexels-photo-11788022.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    origin: 'Vienna',
    priceRange: 2,
    popularity: 90
  },
  {
    id: 'melange',
    nameDE: 'Wiener Melange',
    nameEN: 'Viennese Melange',
    descriptionDE: 'Traditioneller Wiener Kaffee, ähnlich wie Cappuccino, mit Milchschaum.',
    descriptionEN: 'Traditional Viennese coffee, similar to cappuccino, with milk foam.',
    category: 'drink',
    imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    origin: 'Vienna',
    priceRange: 1,
    popularity: 82
  },
  {
    id: 'tafelspitz',
    nameDE: 'Tafelspitz',
    nameEN: 'Boiled Beef',
    descriptionDE: 'Gekochtes Rindfleisch mit Wurzelgemüse und Apfelkren.',
    descriptionEN: 'Boiled beef with root vegetables and apple horseradish.',
    category: 'main',
    imageUrl: 'https://images.pexels.com/photos/6542708/pexels-photo-6542708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    origin: 'Vienna',
    priceRange: 3,
    popularity: 79
  }
];

export default dishes;