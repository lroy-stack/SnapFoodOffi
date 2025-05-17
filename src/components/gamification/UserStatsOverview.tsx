import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Star, MapPin, Utensils, MessageSquare } from 'lucide-react';
import { LanguageContext } from '../../context/LanguageContext';
import { GamificationContext } from '../../contexts/GamificationContext';

const UserStatsOverview: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { userStats, isLoading } = useContext(GamificationContext);

  if (isLoading || !userStats) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const statItems = [
    {
      icon: <Star size={20} className="text-yellow-500" />,
      value: userStats.reviewsCount,
      label: language === 'de' ? 'Bewertungen' : 'Reviews'
    },
    {
      icon: <Camera size={20} className="text-blue-500" />,
      value: userStats.photosCount,
      label: language === 'de' ? 'Fotos' : 'Photos'
    },
    {
      icon: <MessageSquare size={20} className="text-green-500" />,
      value: userStats.commentsCount,
      label: language === 'de' ? 'Kommentare' : 'Comments'
    },
    {
      icon: <MapPin size={20} className="text-red-500" />,
      value: userStats.visitedRestaurants,
      label: language === 'de' ? 'Restaurants' : 'Restaurants'
    },
    {
      icon: <Utensils size={20} className="text-purple-500" />,
      value: userStats.triedDishes,
      label: language === 'de' ? 'Gerichte' : 'Dishes'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">
        {language === 'de' ? 'Deine Aktivitäten' : 'Your Activities'}
      </h3>
      
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statItems.map((item, index) => (
          <motion.div 
            key={index}
            className="bg-gray-50 rounded-lg p-3 text-center"
            variants={itemVariants}
          >
            <div className="flex justify-center mb-2">
              {item.icon}
            </div>
            <div className="text-xl font-bold">{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UserStatsOverview;