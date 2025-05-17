import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../../context/LanguageContext';
import BadgeGallery from './BadgeGallery';

const BadgeCategoryTabs: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', labelDE: 'Alle', labelEN: 'All', emoji: '🏆' },
    { id: 'fotografie', labelDE: 'Fotografie', labelEN: 'Photography', emoji: '📸' },
    { id: 'bewertungen', labelDE: 'Bewertungen', labelEN: 'Ratings', emoji: '⭐' },
    { id: 'kommentare', labelDE: 'Kommentare', labelEN: 'Comments', emoji: '💬' },
    { id: 'erkundung', labelDE: 'Erkundung', labelEN: 'Exploration', emoji: '🗺️' },
    { id: 'gerichte', labelDE: 'Gerichte', labelEN: 'Dishes', emoji: '🍽️' }
  ];

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-4 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 w-max">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center ${
                activeCategory === category.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.emoji}</span>
              <span>{language === 'de' ? category.labelDE : category.labelEN}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Badge gallery for selected category */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BadgeGallery category={activeCategory === 'all' ? undefined : activeCategory} />
      </motion.div>
    </div>
  );
};

export default BadgeCategoryTabs;