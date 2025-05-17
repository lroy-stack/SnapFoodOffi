import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Filter, ArrowDownUp } from 'lucide-react';
import { dishService } from '../../services/DishService';

interface DishFilterProps {
  onFilterChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  activeCategory: string;
}

const DishFilter: React.FC<DishFilterProps> = ({ 
  onFilterChange, 
  onSortChange, 
  activeCategory = 'all' 
}) => {
  const { t } = useTranslation();
  const [activeSort, setActiveSort] = useState('popular');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [categories, setCategories] = useState<{id: string, label: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const dbCategories = await dishService.getCategories();
        
        // Prepare the categories with translations
        const formattedCategories = [
          { id: 'all', label: t('discover.categories.all') },
          ...dbCategories.map(cat => ({
            id: cat,
            label: t(`discover.categories.${cat}`, { 
              defaultValue: cat.charAt(0).toUpperCase() + cat.slice(1) 
            })
          }))
        ];
        
        setCategories(formattedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback to hardcoded categories
        setCategories([
          { id: 'all', label: t('discover.categories.all') },
          { id: 'hauptgericht', label: t('discover.categories.main') },
          { id: 'nachspeise', label: t('discover.categories.dessert') },
          { id: 'vorspeise', label: t('discover.categories.starter') },
          { id: 'getränk', label: t('discover.categories.drink') },
          { id: 'snack', label: t('discover.categories.snack', { defaultValue: 'Snacks' }) }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  const sortOptions = [
    { id: 'popular', label: t('discover.sorting.popular') },
    { id: 'nearMe', label: t('discover.sorting.nearMe') },
    { id: 'priceAsc', label: t('discover.sorting.priceRange', { range: '€-€€€' }) }
  ];

  const handleCategoryChange = (category: string) => {
    onFilterChange(category);
  };

  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    onSortChange(sort);
    setShowFilterMenu(false);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Category filter horizontal scrollable */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex space-x-2 w-max">
          {isLoading ? (
            // Loading placeholders
            Array(5).fill(0).map((_, index) => (
              <div 
                key={index}
                className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
              ></div>
            ))
          ) : (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Sort options */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm"
            >
              <ArrowDownUp size={16} className="mr-2" />
              {sortOptions.find(option => option.id === activeSort)?.label}
            </button>

            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg z-10"
              >
                <div className="p-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        activeSort === option.id
                          ? 'bg-red-50 text-red-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Filter button - can expand to more options */}
          <button className="flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm">
            <Filter size={16} className="mr-2" />
            {t('discover.filter')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishFilter;