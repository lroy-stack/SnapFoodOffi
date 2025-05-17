import React, { useState, useEffect, useContext } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Utensils, Loader } from 'lucide-react';
import { LanguageContext } from '../../context/LanguageContext';
import { Restaurant } from '../../types';
import { restaurantService } from '../../services/RestaurantService';
import 'maplibre-gl/dist/maplibre-gl.css';

interface RestaurantMapProps {
  dishId?: string;
}

const RestaurantMap: React.FC<RestaurantMapProps> = ({ dishId }) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const [viewState, setViewState] = useState({
    latitude: 48.2082,
    longitude: 16.3738,
    zoom: 13
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dishPrices, setDishPrices] = useState<Record<string, number>>({});

  // Fetch all restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Cargando restaurantes en el mapa...');
        const allRestaurants = await restaurantService.getAllRestaurants();
        console.log(`🍽️ ${allRestaurants.length} restaurantes cargados en el mapa`);
        
        // Verificar si hay coordenadas inválidas
        const validRestaurants = allRestaurants.filter(r => {
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
        
        if (validRestaurants.length !== allRestaurants.length) {
          console.warn(`⚠️ ${allRestaurants.length - validRestaurants.length} restaurantes omitidos por coordenadas inválidas`);
        }
        
        setRestaurants(validRestaurants);
        if (!dishId) {
          setFilteredRestaurants(validRestaurants);
        }
      } catch (error) {
        console.error('❌ Error al cargar restaurantes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // Filter restaurants by dish if dishId is provided
  useEffect(() => {
    const filterRestaurants = async () => {
      if (!dishId || restaurants.length === 0) return;
      
      setIsLoading(true);
      try {
        // Get restaurants that serve this specific dish
        const dishRestaurants = await restaurantService.getRestaurantsByDish(dishId);
        setFilteredRestaurants(dishRestaurants);
        
        // Fetch dish prices for each restaurant
        const priceMap: Record<string, number> = {};
        
        for (const restaurant of dishRestaurants) {
          const dishes = await restaurantService.getDishesByRestaurant(restaurant.id);
          const dishInfo = dishes.find(d => d.gericht_id === dishId);
          if (dishInfo) {
            priceMap[restaurant.id] = dishInfo.preis;
          }
        }
        
        setDishPrices(priceMap);
        
        // If we have restaurants for this dish, center the map on the first one
        if (dishRestaurants.length > 0) {
          setViewState({
            latitude: dishRestaurants[0].coordinates.lat,
            longitude: dishRestaurants[0].coordinates.lng,
            zoom: 14
          });
        }
      } catch (error) {
        console.error('Error filtering restaurants by dish:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    filterRestaurants();
  }, [dishId, restaurants]);

  // Close popup when clicking elsewhere on map
  const handleClick = () => {
    setSelectedRestaurant(null);
  };

  return (
    <div className="h-[70vh] w-full rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="w-10 h-10 text-red-600 animate-spin" />
            <p className="mt-2 text-gray-700 font-medium">{t('map.loading')}</p>
          </div>
        </div>
      )}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleClick}
        mapLib={import('maplibre-gl') as any}
        mapStyle="https://demotiles.maplibre.org/style.json"
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        
        {filteredRestaurants.map(restaurant => (
          <Marker
            key={restaurant.id}
            longitude={restaurant.coordinates.lng}
            latitude={restaurant.coordinates.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedRestaurant(restaurant);
            }}
          >
            <div className="flex flex-col items-center cursor-pointer" title={restaurant.name}>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200">
                <Utensils size={18} />
              </div>
              {dishId && dishPrices[restaurant.id] && (
                <div className="mt-1 px-2 py-0.5 bg-white rounded-full text-xs font-bold shadow text-red-600 border border-red-100">
                  {dishPrices[restaurant.id].toFixed(2)} €
                </div>
              )}
            </div>
          </Marker>
        ))}
        
        {selectedRestaurant && (
          <Popup
            longitude={selectedRestaurant.coordinates.lng}
            latitude={selectedRestaurant.coordinates.lat}
            anchor="bottom"
            onClose={() => setSelectedRestaurant(null)}
            closeButton={true}
            closeOnClick={false}
            className="z-50"
          >
            <div className="p-3 min-w-[220px]">
              <h3 className="font-bold text-lg text-gray-900">{selectedRestaurant.name}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1.5">
                <MapPin size={14} className="text-red-500" />
                {selectedRestaurant.address}
              </p>
              <p className="text-xs text-gray-500 mt-1">{selectedRestaurant.district}</p>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < Math.floor(selectedRestaurant.rating) ? "text-yellow-500 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-xs font-medium text-yellow-700">{selectedRestaurant.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                  {'€'.repeat(selectedRestaurant.priceRange)}
                </span>
              </div>
              
              {/* Si estamos mostrando un plato específico, mostrar su precio */}
              {dishId && dishPrices[selectedRestaurant.id] && (
                <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-100">
                  <h4 className="font-medium text-sm text-red-800">
                    {t('map.dishPrice')}:
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-700 text-sm">{dishId.replace(/-/g, ' ')}</span>
                    <span className="font-bold text-red-700">{dishPrices[selectedRestaurant.id].toFixed(2)} €</span>
                  </div>
                </div>
              )}
              
              <button 
                className="mt-3 w-full py-2 bg-red-600 text-white text-sm rounded-md font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                {t('dish.findNearby')}
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default RestaurantMap;
