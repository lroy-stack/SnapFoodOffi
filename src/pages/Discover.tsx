import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DishList from '../components/dishes/DishList';

const Discover: React.FC = () => {
  const { t } = useTranslation();
  
  // Set page title
  useEffect(() => {
    document.title = 'FoodSnap Vienna - ' + t('discover.title');
  }, [t]);

  return (
    <div className="container mx-auto px-4 pt-20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('discover.title')}</h1>
        <p className="text-gray-600 mt-2 font-light text-lg max-w-xl">
          {t('app.tagline')}
        </p>
        
        <div className="w-20 h-1 bg-red-500 rounded-full mt-4 mb-6"></div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DishList />
      </motion.div>
    </div>
  );
};

export default Discover;
