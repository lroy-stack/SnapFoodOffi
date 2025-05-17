import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Dish } from '../../types';
import { LanguageContext } from '../../context/LanguageContext';

interface DishCardProps {
  dish: Dish;
}

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { language } = useContext(LanguageContext);
  const name = language === 'de' ? dish.nameDE : dish.nameEN;
  const description = language === 'de' ? dish.descriptionDE : dish.descriptionEN;

  // Price range display
  const priceDisplay = '€'.repeat(dish.priceRange);
  
  // Category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hauptgericht':
        return language === 'de' ? 'Hauptgericht' : 'Main Dish';
      case 'nachspeise':
        return language === 'de' ? 'Nachspeise' : 'Dessert';
      case 'vorspeise':
        return language === 'de' ? 'Vorspeise' : 'Starter';
      case 'getränk':
        return language === 'de' ? 'Getränk' : 'Drink';
      case 'snack':
        return language === 'de' ? 'Snack' : 'Snack';
      default:
        return category;
    }
  };

  return (
    <motion.div 
      className="rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/dish/${dish.id}`}>
        <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
          <img 
            src={dish.imageUrl} 
            alt={name} 
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-black/70 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
              {getCategoryLabel(dish.category)}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1.5 tracking-tight">{name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md">
              <Star size={16} className="text-yellow-500 fill-current" />
              <span className="ml-1 text-sm font-medium text-yellow-700">{(dish.popularity / 20).toFixed(1)}</span>
            </div>
            <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">{priceDisplay}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DishCard;
