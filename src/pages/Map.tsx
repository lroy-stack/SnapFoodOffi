import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, List, Filter, X } from 'lucide-react';
import RestaurantMap from '../components/map/RestaurantMap';
import { restaurantService } from '../services/RestaurantService';

const DistrictList = [
  '1. Bezirk', '2. Bezirk', '3. Bezirk', '4. Bezirk', '5. Bezirk',
  '6. Bezirk', '7. Bezirk', '8. Bezirk', '9. Bezirk', '10. Bezirk',
  '11. Bezirk', '12. Bezirk', '13. Bezirk', '14. Bezirk', '15. Bezirk',
  '16. Bezirk', '17. Bezirk', '18. Bezirk', '19. Bezirk', '20. Bezirk',
  '21. Bezirk', '22. Bezirk', '23. Bezirk'
];

const Map: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Obtener la ubicación del usuario
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(t('map.geolocationNotSupported', 'La geolocalización no está soportada por su navegador'));
      return;
    }
    
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoadingLocation(false);
      },
      () => {
        alert(t('map.locationError', 'No se pudo obtener su ubicación'));
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-24">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('map.restaurants')}</h1>
        <p className="text-gray-600 mt-1">
          {t('map.description')}
        </p>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={handleGetLocation}
          className={`flex items-center px-4 py-2 ${userLocation ? 'bg-green-600' : 'bg-red-600'} text-white rounded-lg shadow-sm hover:shadow transition-shadow`}
          disabled={isLoadingLocation}
        >
          <span className="mr-2">
            {isLoadingLocation 
              ? t('map.locating') 
              : userLocation 
                ? t('map.locationFound') 
                : t('map.nearMe')}
          </span>
          <MapPin size={18} />
        </button>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 ${showFilters ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg shadow-sm hover:shadow transition-shadow`}
        >
          <span className="mr-2">{t('map.filter')}</span>
          {showFilters ? <X size={18} /> : <Filter size={18} />}
        </button>
      </div>
      
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-medium text-gray-800 mb-2 flex items-center">
            <List size={18} className="mr-2" />
            {t('map.districts')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {DistrictList.map(district => (
              <button
                key={district}
                onClick={() => setSelectedDistrict(selectedDistrict === district ? null : district)}
                className={`text-sm py-1 px-3 rounded-full ${
                  selectedDistrict === district 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <RestaurantMap />
    </div>
  );
};

export default Map;
