import { supabaseService } from './supabaseService';
import { Restaurant } from '../types';
import { restaurants as fallbackRestaurants } from '../data/restaurants';

/**
 * Servicio para gestionar los datos de restaurantes y sus platos asociados
 */
class RestaurantService {
  
  /**
   * Obtiene todos los restaurantes con sus coordenadas
   * @returns Array de restaurantes o datos de respaldo en caso de error
   */
  async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('🔍 Obteniendo todos los restaurantes desde Supabase...');
      
      // Mejorar la consulta para asegurar que obtenemos todos los registros
      const { data, error } = await supabaseService.supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          district,
          rating,
          price_range,
          lat,
          lng,
          gericht_restaurant (
            gericht_id
          )
        `)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('❌ Error al obtener restaurantes:', error);
        console.warn('⚠️ Usando datos de respaldo temporales');
        return fallbackRestaurants;
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron restaurantes en la base de datos, usando datos de respaldo');
        return fallbackRestaurants;
      }
      
      console.log(`✅ ${data.length} restaurantes obtenidos correctamente`);
      
      // Transformar los datos al formato esperado por la aplicación
      const restaurants = data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        district: restaurant.district,
        rating: restaurant.rating || 4.0, // Valor predeterminado en caso de null
        priceRange: restaurant.price_range || 2, // Valor predeterminado en caso de null
        coordinates: {
          lat: restaurant.lat,
          lng: restaurant.lng
        },
        dishes: restaurant.gericht_restaurant?.map((gr: any) => gr.gericht_id) || []
      }));
      
      console.log('🗺️ Restaurantes disponibles en el mapa:', restaurants.length);
      return restaurants;
    } catch (error) {
      console.error('Error inesperado al obtener restaurantes:', error);
      return fallbackRestaurants;
    }
  }
  
  /**
   * Obtiene los restaurantes que ofrecen un plato específico
   * @param dishId ID del plato
   * @returns Restaurantes filtrados que ofrecen el plato
   */
  async getRestaurantsByDish(dishId: string): Promise<Restaurant[]> {
    try {
      console.log(`🔍 Buscando restaurantes que ofrecen el plato ${dishId}...`);
      
      const { data, error } = await supabaseService.supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          district,
          rating,
          price_range,
          lat,
          lng,
          gericht_restaurant!inner (
            gericht_id
          )
        `)
        .eq('gericht_restaurant.gericht_id', dishId);
      
      if (error) {
        console.error(`❌ Error al obtener restaurantes para el plato ${dishId}:`, error);
        console.warn('⚠️ Usando datos de respaldo filtrados para este plato');
        return fallbackRestaurants.filter(r => r.dishes.includes(dishId));
      }
      
      if (!data || data.length === 0) {
        console.warn(`⚠️ No se encontraron restaurantes para el plato ${dishId}, usando datos de respaldo`);
        return fallbackRestaurants.filter(r => r.dishes.includes(dishId));
      }
      
      console.log(`✅ Encontrados ${data.length} restaurantes que ofrecen el plato ${dishId}`);
      
      // Transformar los datos al formato esperado por la aplicación
      const restaurants = data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        district: restaurant.district,
        rating: restaurant.rating || 4.0, // Valor predeterminado en caso de null
        priceRange: restaurant.price_range || 2, // Valor predeterminado en caso de null
        coordinates: {
          lat: restaurant.lat,
          lng: restaurant.lng
        },
        dishes: restaurant.gericht_restaurant?.map((gr: any) => gr.gericht_id) || []
      }));
      
      // Verificar coordenadas válidas
      const validRestaurants = restaurants.filter(r => {
        const validCoords = r.coordinates && 
          r.coordinates.lat && 
          r.coordinates.lng && 
          !isNaN(r.coordinates.lat) && 
          !isNaN(r.coordinates.lng);
        
        if (!validCoords) {
          console.warn(`⚠️ Restaurante con coordenadas inválidas omitido: ${r.name}`);
        }
        return validCoords;
      });
      
      return validRestaurants;
    } catch (error) {
      console.error(`Error inesperado al obtener restaurantes para el plato ${dishId}:`, error);
      return fallbackRestaurants.filter(r => r.dishes.includes(dishId));
    }
  }
  
  /**
   * Obtiene los detalles de platos disponibles en un restaurante específico
   * @param restaurantId ID del restaurante
   * @returns Array con detalles de los platos y sus precios
   */
  async getDishesByRestaurant(restaurantId: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('gericht_restaurant')
        .select(`
          gericht_id,
          preis,
          verfügbar,
          gerichte (
            name_de,
            name_en,
            kategorie,
            bild_url
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('verfügbar', true);
      
      if (error) {
        console.error(`Error al obtener platos para el restaurante ${restaurantId}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error inesperado al obtener platos para el restaurante ${restaurantId}:`, error);
      return [];
    }
  }
  
  /**
   * Obtiene restaurantes por distrito
   * @param district Distrito (ejemplo: "1. Bezirk")
   */
  async getRestaurantsByDistrict(district: string): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          district,
          rating,
          price_range,
          lat,
          lng,
          gericht_restaurant (
            gericht_id
          )
        `)
        .eq('district', district);
      
      if (error) {
        console.error(`Error al obtener restaurantes para el distrito ${district}:`, error);
        return fallbackRestaurants.filter(r => r.district === district);
      }
      
      // Transformar los datos al formato esperado por la aplicación
      return data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        district: restaurant.district,
        rating: restaurant.rating,
        priceRange: restaurant.price_range,
        coordinates: {
          lat: restaurant.lat,
          lng: restaurant.lng
        },
        dishes: restaurant.gericht_restaurant.map((gr: any) => gr.gericht_id)
      }));
    } catch (error) {
      console.error(`Error inesperado al obtener restaurantes para el distrito ${district}:`, error);
      return fallbackRestaurants.filter(r => r.district === district);
    }
  }
}

export const restaurantService = new RestaurantService();
export default restaurantService;
