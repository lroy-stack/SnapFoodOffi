import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, MapPin, Share2, Info, Clock, Loader, ChevronLeft, AlertCircle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import RestaurantMap from '../components/map/RestaurantMap';
import useDish from '../hooks/useDish';

const DishDetail: React.FC = () => {
  const { dishId } = useParams<{ dishId: string }>();
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  
  const { dish, relatedRestaurants, isLoading, error } = useDish(dishId);
  
  // Set the document title when dish loads
  useEffect(() => {
    if (dish) {
      document.title = language === 'de' ? dish.nameDE : dish.nameEN;
    } else {
      document.title = 'Dish Detail';
    }
    
    return () => {
      document.title = 'FoodSnap Vienna';
    };
  }, [dish, language]);
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 pb-24">
        <Loader size={48} className="text-red-600 animate-spin mb-4" />
        <p className="text-gray-600">
          {language === 'de' ? 'Lade Gericht...' : 'Loading dish...'}
        </p>
      </div>
    );
  }
  
  // Error state
  if (error || !dish) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-6 flex flex-col items-center">
          <AlertCircle className="mb-2" size={48} />
          <h2 className="text-xl font-semibold mb-2">
            {language === 'de' ? 'Gericht nicht gefunden' : 'Dish not found'}
          </h2>
          <p className="text-center mb-4">
            {error || (language === 'de' ? 'Das gewünschte Gericht konnte nicht gefunden werden.' : 'The requested dish could not be found.')}
          </p>
          <Link 
            to="/discover" 
            className="text-white bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition"
          >
            {language === 'de' ? 'Zurück zur Übersicht' : 'Back to Discover'}
          </Link>
        </div>
      </div>
    );
  }
  
  // Get dish details based on language
  const name = language === 'de' ? dish.nameDE : dish.nameEN;
  const description = language === 'de' ? dish.descriptionDE : dish.descriptionEN;
  const price = '€'.repeat(dish.priceRange);
  
  return (
    <div className="pb-24">
      {/* Back button */}
      <div className="fixed z-20 top-20 left-4">
        <button 
          onClick={handleBack}
          className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      {/* Dish image and name */}
      <div className="relative h-72 bg-gray-200">
        <img 
          src={dish.imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
          <h1 className="text-3xl font-bold text-white">{name}</h1>
        </div>
      </div>
      
      {/* Quick info */}
      <div className="px-4 py-4 bg-white shadow-sm flex justify-between">
        <div className="flex items-center">
          <Star className="text-yellow-500 fill-current" size={20} />
          <span className="ml-1 font-medium">{dish.popularity / 20}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <span className="font-medium mr-2">{price}</span>
          <span className="text-sm">{dish.origin}</span>
        </div>
        
        <button 
          className="flex items-center text-gray-600"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: name,
                text: description.substring(0, 100) + '...',
                url: window.location.href,
              });
            }
          }}
        >
          <Share2 size={20} />
        </button>
      </div>
      
      {/* Content tabs */}
      <div className="px-4 mt-4">
        <div className="flex border-b overflow-x-auto no-scrollbar">
          <button 
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap ${activeTab === 'description' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('description')}
          >
            {t('dish.history')}
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap ${activeTab === 'restaurants' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('restaurants')}
          >
            {t('dish.findNearby')}
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap ${activeTab === 'reviews' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('reviews')}
          >
            {t('dish.reviews')}
          </button>
        </div>
        
        <div className="py-4">
          {activeTab === 'description' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-700 whitespace-pre-line">{description}</p>
              
              {/* Additional historical info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start">
                  <Info size={20} className="text-gray-500 mr-2 mt-1" />
                  <div>
                    <h3 className="font-medium">
                      {language === 'de' ? 'Wissenswertes' : 'Did you know?'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'de' 
                        ? 'Dieses Gericht ist ein wichtiger Teil der Wiener Esskultur und wird häufig in traditionellen Restaurants serviert.'
                        : 'This dish is an important part of Viennese food culture and is frequently served in traditional restaurants.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'restaurants' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-700 mb-4">
                {language === 'de'
                  ? `${relatedRestaurants.length} Restaurants in Wien servieren ${dish.nameDE}`
                  : `${relatedRestaurants.length} restaurants in Vienna serve ${dish.nameEN}`}
              </p>
              
              {relatedRestaurants.length > 0 ? (
                <>
                  <RestaurantMap dishId={dish.id} />
                  
                  <div className="mt-4 space-y-3">
                    {relatedRestaurants.map(restaurant => (
                      <div 
                        key={restaurant.id} 
                        className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium">{restaurant.name}</h3>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPin size={12} className="mr-1" />
                            {restaurant.address}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            <Star size={14} className="text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm">{restaurant.rating.toFixed(1)}</span>
                          </div>
                          
                          <button className="bg-gray-100 p-2 rounded-full">
                            <Clock size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {language === 'de'
                      ? 'Derzeit sind keine Restaurants verfügbar, die dieses Gericht servieren.'
                      : 'Currently no restaurants available that serve this dish.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  {language === 'de' ? 'Bewertungen & Fotos' : 'Reviews & Photos'}
                </h3>
                <Link
                  to={`/upload?dishId=${dish.id}`}
                  className="bg-red-600 text-white text-sm py-1.5 px-3 rounded-full font-medium"
                >
                  {t('dish.addReview')}
                </Link>
              </div>
              
              {/* Reviews placeholder - would be populated with real reviews in production */}
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  {language === 'de'
                    ? 'Noch keine Bewertungen für dieses Gericht.'
                    : 'No reviews for this dish yet.'}
                </p>
                <Link
                  to={`/upload?dishId=${dish.id}`}
                  className="mt-3 inline-block text-red-600 font-medium"
                >
                  {language === 'de' 
                    ? 'Sei der Erste, der eine Bewertung abgibt!' 
                    : 'Be the first to leave a review!'}
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishDetail;