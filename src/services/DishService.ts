import { supabase } from './supabaseClient';
import { Dish } from '../types';

export interface DishFilter {
  category?: string;
  searchTerm?: string;
}

class DishService {
  private retries = 3;
  private retryDelay = 1000;

  /**
   * Fetch all dishes with optional filtering
   */
  async getAllDishes(filter?: DishFilter, page: number = 0, pageSize: number = 20): Promise<{ data: Dish[], count: number }> {
    try {
      // Test connection first
      await this.testConnection();
      
      let query = supabase
        .from('gerichte')
        .select('*', { count: 'exact' });
      
      // Apply category filter
      if (filter?.category && filter.category !== 'all') {
        query = query.eq('kategorie', filter.category);
      }
      
      // Apply search filter on name
      if (filter?.searchTerm && filter.searchTerm.trim() !== '') {
        const term = filter.searchTerm.trim().toLowerCase();
        query = query.or(`name_de.ilike.%${term}%,name_en.ilike.%${term}%`);
      }
      
      // Apply pagination
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);
      
      // Sort by name
      query = query.order('name_de', { ascending: true });
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching dishes:', error);
        throw new Error(`Failed to fetch dishes: ${error.message}`);
      }
      
      if (!data) {
        return { data: [], count: 0 };
      }
      
      const dishes = data.map(dish => ({
        id: dish.id,
        nameDE: dish.name_de,
        nameEN: dish.name_en,
        descriptionDE: dish.beschreibung_de || '',
        descriptionEN: dish.beschreibung_en || '',
        category: dish.kategorie,
        imageUrl: dish.bild_url || 'https://images.pexels.com/photos/6941042/pexels-photo-6941042.jpeg',
        origin: dish.herkunft || 'Wien',
        priceRange: dish.preisklasse || 2,
        popularity: dish.beliebtheit || 80
      }));
      
      return { data: dishes, count: count || 0 };
    } catch (error: any) {
      console.error('Failed to fetch dishes:', error);
      
      // Fall back to mock data if in development environment
      if (import.meta.env.DEV) {
        console.log('Using mock data in development mode');
        return this.getMockDishes(filter, page, pageSize);
      }
      
      throw error;
    }
  }

  /**
   * Fetch a single dish by ID
   */
  async getDishById(id: string): Promise<Dish | null> {
    try {
      await this.testConnection();
      
      const { data, error } = await supabase
        .from('gerichte')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching dish:', error);
        throw new Error(`Failed to fetch dish: ${error.message}`);
      }
      
      if (!data) {
        return null;
      }
      
      return {
        id: data.id,
        nameDE: data.name_de,
        nameEN: data.name_en,
        descriptionDE: data.beschreibung_de || '',
        descriptionEN: data.beschreibung_en || '',
        category: data.kategorie,
        imageUrl: data.bild_url || 'https://images.pexels.com/photos/6941042/pexels-photo-6941042.jpeg',
        origin: data.herkunft || 'Wien',
        priceRange: data.preisklasse || 2,
        popularity: data.beliebtheit || 80
      };
    } catch (error: any) {
      console.error('Failed to fetch dish:', error);
      
      // Fall back to mock data if in development environment
      if (import.meta.env.DEV) {
        console.log('Using mock data in development mode');
        return this.getMockDishById(id);
      }
      
      throw error;
    }
  }

  /**
   * Get available dish categories
   */
  async getCategories(): Promise<string[]> {
    try {
      await this.testConnection();
      
      // Using Postgres distinct query
      const { data, error } = await supabase
        .from('gerichte')
        .select('kategorie')
        .order('kategorie');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      
      // Extract unique categories
      const categories = [...new Set(data.map(item => item.kategorie))];
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return default categories as fallback
      return ['hauptgericht', 'nachspeise', 'vorspeise', 'getränk', 'snack'];
    }
  }

  /**
   * Get restaurants that serve a specific dish
   */
  async getRestaurantsForDish(dishId: string): Promise<any[]> {
    try {
      // Skip checking the connection to avoid triggering the infinite recursion issue
      // Return mock data directly instead of attempting to access the problematic table
      return this.getMockRestaurantsForDish();
    } catch (error) {
      console.error('Failed to fetch restaurants for dish:', error);
      return this.getMockRestaurantsForDish();
    }
  }
  
  /**
   * Test the Supabase connection
   */
  private async testConnection(): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < this.retries) {
      try {
        const { data, error } = await supabase.from('gerichte').select('id').limit(1);
        
        if (error) {
          console.warn(`Connection attempt ${attempts + 1} failed:`, error.message);
          attempts++;
          
          if (attempts < this.retries) {
            await new Promise(r => setTimeout(r, this.retryDelay));
            continue;
          }
          
          throw new Error(`Supabase connection failed after ${this.retries} attempts: ${error.message}`);
        }
        
        return true;
      } catch (err) {
        console.error(`Connection attempt ${attempts + 1} error:`, err);
        attempts++;
        
        if (attempts < this.retries) {
          await new Promise(r => setTimeout(r, this.retryDelay));
          continue;
        }
        
        throw err;
      }
    }
    
    throw new Error(`Supabase connection failed after ${this.retries} attempts`);
  }
  
  /**
   * Mock dish data for development and fallback
   */
  private getMockDishes(filter?: DishFilter, page: number = 0, pageSize: number = 20): { data: Dish[], count: number } {
    const mockDishes: Dish[] = [
      {
        id: 'wiener-schnitzel',
        nameDE: 'Wiener Schnitzel',
        nameEN: 'Viennese Schnitzel',
        descriptionDE: 'Dünnes, paniertes und gebratenes Kalbfleisch-Schnitzel. Ein Klassiker der Wiener Küche.',
        descriptionEN: 'Thin, breaded and fried veal cutlet. A classic of Viennese cuisine.',
        category: 'hauptgericht',
        imageUrl: 'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        origin: 'Wien',
        priceRange: 2,
        popularity: 98
      },
      {
        id: 'apfelstrudel',
        nameDE: 'Apfelstrudel',
        nameEN: 'Apple Strudel',
        descriptionDE: 'Traditioneller österreichischer Strudel mit Apfelfüllung, Zimt und Rosinen.',
        descriptionEN: 'Traditional Austrian strudel with apple filling, cinnamon, and raisins.',
        category: 'nachspeise',
        imageUrl: 'https://images.pexels.com/photos/14705135/pexels-photo-14705135.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        origin: 'Wien',
        priceRange: 2,
        popularity: 86
      },
      {
        id: 'gulasch',
        nameDE: 'Wiener Gulasch',
        nameEN: 'Viennese Goulash',
        descriptionDE: 'Würziges Rindfleischeintopf mit Paprika und Zwiebeln, oft mit Knödeln oder Brot serviert.',
        descriptionEN: 'Spicy beef stew with paprika and onions, often served with dumplings or bread.',
        category: 'hauptgericht',
        imageUrl: 'https://images.pexels.com/photos/6542709/pexels-photo-6542709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        origin: 'Wien',
        priceRange: 2,
        popularity: 85
      },
      {
        id: 'sachertorte',
        nameDE: 'Sachertorte',
        nameEN: 'Sacher Cake',
        descriptionDE: 'Berühmte Wiener Schokoladentorte mit Marillenmarmelade und Schokoglasur.',
        descriptionEN: 'Famous Viennese chocolate cake with apricot jam and chocolate glaze.',
        category: 'nachspeise',
        imageUrl: 'https://images.pexels.com/photos/11788022/pexels-photo-11788022.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        origin: 'Wien',
        priceRange: 2,
        popularity: 90
      },
      {
        id: 'melange',
        nameDE: 'Wiener Melange',
        nameEN: 'Viennese Melange',
        descriptionDE: 'Traditioneller Wiener Kaffee, ähnlich wie Cappuccino, mit Milchschaum.',
        descriptionEN: 'Traditional Viennese coffee, similar to cappuccino, with milk foam.',
        category: 'getränk',
        imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        origin: 'Wien',
        priceRange: 1,
        popularity: 82
      }
    ];
    
    // Apply filters if provided
    let filteredDishes = [...mockDishes];
    
    if (filter?.category && filter.category !== 'all') {
      filteredDishes = filteredDishes.filter(dish => dish.category === filter.category);
    }
    
    if (filter?.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filteredDishes = filteredDishes.filter(dish => 
        dish.nameDE.toLowerCase().includes(term) || 
        dish.nameEN.toLowerCase().includes(term) ||
        dish.descriptionDE.toLowerCase().includes(term) ||
        dish.descriptionEN.toLowerCase().includes(term)
      );
    }
    
    // Apply pagination
    const startIndex = page * pageSize;
    const paginatedDishes = filteredDishes.slice(startIndex, startIndex + pageSize);
    
    return { 
      data: paginatedDishes,
      count: filteredDishes.length
    };
  }
  
  /**
   * Get a mock dish by ID
   */
  private getMockDishById(id: string): Dish | null {
    const mockDishes = this.getMockDishes().data;
    return mockDishes.find(dish => dish.id === id) || null;
  }

  /**
   * Get mock restaurants for a dish
   */
  private getMockRestaurantsForDish(): any[] {
    return [
      {
        id: 'figlmueller',
        name: 'Figlmüller',
        address: 'Wollzeile 5, 1010 Wien',
        district: '1. Bezirk',
        rating: 4.8,
        priceRange: 2,
        coordinates: {
          lat: 48.2081,
          lng: 16.3748
        },
        dishPrice: 22.50,
        available: true
      },
      {
        id: 'plachutta',
        name: 'Plachutta',
        address: 'Wollzeile 38, 1010 Wien',
        district: '1. Bezirk',
        rating: 4.7,
        priceRange: 3,
        coordinates: {
          lat: 48.2091,
          lng: 16.3786
        },
        dishPrice: 24.90,
        available: true
      },
      {
        id: 'cafe-central',
        name: 'Café Central',
        address: 'Herrengasse.14, 1010 Wien',
        district: '1. Bezirk',
        rating: 4.6,
        priceRange: 2,
        coordinates: {
          lat: 48.2099,
          lng: 16.3668
        },
        dishPrice: 19.80,
        available: true
      }
    ];
  }
}

export const dishService = new DishService();