import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import { GamificationContext } from '../../contexts/GamificationContext';
import { Badge } from '../../types';

interface BadgeGalleryProps {
  category?: string;
  compact?: boolean;
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ category, compact = false }) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { allBadges, earnedBadgeIds, isLoading } = useContext(GamificationContext);

  // Filter badges by category if specified
  const filteredBadges = category 
    ? allBadges.filter(badge => badge.category === category)
    : allBadges;

  // Sort badges: earned first, then by level required
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aEarned = earnedBadgeIds.includes(a.id);
    const bEarned = earnedBadgeIds.includes(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return a.levelRequired - b.levelRequired;
  });

  if (isLoading) {
    return <div className="flex justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>;
  }

  // Grid columns based on compact mode
  const gridClass = compact 
    ? "grid grid-cols-3 gap-2" 
    : "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";

  return (
    <div className={gridClass}>
      {sortedBadges.map(badge => (
        <BadgeItem 
          key={badge.id} 
          badge={badge} 
          isEarned={earnedBadgeIds.includes(badge.id)} 
          language={language}
          compact={compact}
        />
      ))}
    </div>
  );
};

interface BadgeItemProps {
  badge: Badge;
  isEarned: boolean;
  language: 'de' | 'en';
  compact?: boolean;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, isEarned, language, compact = false }) => {
  const badgeName = language === 'de' ? badge.nameDE : badge.nameEN;
  const badgeDescription = language === 'de' ? badge.descriptionDE : badge.descriptionEN;
  
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      whileHover={isEarned ? { scale: 1.05 } : { scale: 1.02 }}
      whileTap={isEarned ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div 
        className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-full flex items-center justify-center mb-2 ${
          isEarned ? getBadgeColor(badge.category) : 'bg-gray-200'
        }`}
      >
        {/* This would be a real icon in production */}
        <span className={`${compact ? 'text-lg' : 'text-2xl'}`}>{getBadgeEmoji(badge.category)}</span>
      </div>
      
      <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium mb-1 line-clamp-1`}>
        {badgeName}
      </span>
      
      {!compact && (
        <span className="text-xs text-gray-500 line-clamp-2">
          {isEarned ? badgeDescription : '???'}
        </span>
      )}
      
      {!isEarned && (
        <div className="mt-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
          {language === 'de' ? 'Gesperrt' : 'Locked'}
        </div>
      )}
    </motion.div>
  );
};

// Helper functions for badge styling
const getBadgeColor = (category: string): string => {
  switch (category) {
    case 'fotografie':
      return 'bg-yellow-400';
    case 'kommentare':
      return 'bg-blue-400';
    case 'bewertungen':
      return 'bg-red-400';
    case 'erkundung':
      return 'bg-green-400';
    case 'gerichte':
      return 'bg-purple-400';
    default:
      return 'bg-yellow-400';
  }
};

const getBadgeEmoji = (category: string): string => {
  switch (category) {
    case 'fotografie':
      return '📸';
    case 'kommentare':
      return '💬';
    case 'bewertungen':
      return '⭐';
    case 'erkundung':
      return '🗺️';
    case 'gerichte':
      return '🍽️';
    default:
      return '🏆';
  }
};

export default BadgeGallery;