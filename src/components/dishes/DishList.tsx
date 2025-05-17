import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader } from 'lucide-react';
import DishCard from './DishCard';
import DishFilter from './DishFilter';
import SearchBar from './SearchBar';
import { LanguageContext } from '../../context/LanguageContext';
import useDishes from '../../hooks/useDishes';

const DishList: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const [search, setSearch] = useState('');
  const { 
    dishes, 
    totalCount, 
    isLoading, 
    error,
    filter, 
    setFilter,
    setPage
  } = useDishes({});
  
  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filter.searchTerm) {
        setFilter({ ...filter, searchTerm: search });
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setFilter({ ...filter, category });
    setPage(0);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    // Sorting logic would be implemented here
    // We would modify the setFilter call to include sort parameters
  };

  // Container animation for dishes grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar 
          value={search} 
          onChange={setSearch} 
          placeholder={language === 'de' ? 'Gerichte suchen...' : 'Search dishes...'}
        />
      </div>
      
      {/* Filters */}
      <DishFilter 
        onFilterChange={handleCategoryChange}
        onSortChange={handleSortChange}
        activeCategory={filter.category || 'all'}
      />
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size={40} className="text-red-600 animate-spin" />
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-600">
            {language === 'de' 
              ? 'Keine Gerichte gefunden' 
              : 'No dishes found'}
          </h3>
          <p className="text-gray-500 mt-2">
            {language === 'de'
              ? 'Versuche es mit anderen Suchbegriffen oder Filtern'
              : 'Try different search terms or filters'}
          </p>
        </div>
      ) : (
        <>
          {/* Results counter */}
          <div className="mb-4 text-sm text-gray-600">
            {language === 'de'
              ? `${totalCount} Gerichte gefunden`
              : `${totalCount} dishes found`}
          </div>
          
          {/* Dishes grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {dishes.map(dish => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default DishList;