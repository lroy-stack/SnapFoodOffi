import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../types';
import { LanguageContext } from '../../context/LanguageContext';

interface BadgesListProps {
  badges: Badge[];
  earnedBadges: string[];
}

const BadgesList: React.FC<BadgesListProps> = ({ badges, earnedBadges }) => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="grid grid-cols-3 gap-4">
      {badges.map(badge => {
        const isEarned = earnedBadges.includes(badge.id);
        const badgeName = language === 'de' ? badge.nameDE : badge.nameEN;
        
        return (
          <motion.div
            key={badge.id}
            className="flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
              isEarned ? getBadgeColor(badge.category) : 'bg-gray-200'
            }`}>
              {/* This would be a real icon in production */}
              <span className="text-xl">{getBadgeEmoji(badge.category)}</span>
            </div>
            <span className="text-xs text-center font-medium">
              {badgeName}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

// Helper functions for badge styling
const getBadgeColor = (category: string): string => {
  switch (category) {
    case 'photography':
      return 'bg-yellow-400';
    case 'comments':
      return 'bg-blue-400';
    case 'ratings':
      return 'bg-red-400';
    case 'exploration':
      return 'bg-green-400';
    case 'dishes':
      return 'bg-purple-400';
    default:
      return 'bg-gray-400';
  }
};

const getBadgeEmoji = (category: string): string => {
  switch (category) {
    case 'photography':
      return '📸';
    case 'comments':
      return '💬';
    case 'ratings':
      return '⭐';
    case 'exploration':
      return '🗺️';
    case 'dishes':
      return '🍽️';
    default:
      return '🏆';
  }
};

export default BadgesList;