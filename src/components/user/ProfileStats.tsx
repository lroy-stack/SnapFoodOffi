import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User } from '../../types';

interface ProfileStatsProps {
  user: User;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const { t } = useTranslation();
  
  // Calculate level progress for progress bar
  const getLevelProgress = (): number => {
    let progress = 0;
    
    switch (user.level) {
      case 1: // Beginner (0-6)
        progress = (user.points / 6) * 100;
        break;
      case 2: // Beginner Foodie (7-49)
        progress = ((user.points - 7) / (49 - 7)) * 100;
        break;
      case 3: // Regular Foodie (50-99)
        progress = ((user.points - 50) / (99 - 50)) * 100;
        break;
      case 4: // Featured Foodie (100-249)
        progress = ((user.points - 100) / (249 - 100)) * 100;
        break;
      case 5: // Expert Foodie (250-499)
        progress = ((user.points - 250) / (499 - 250)) * 100;
        break;
      case 6: // Top Foodie (500+)
        progress = 100;
        break;
      default:
        progress = 0;
    }
    
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // Get level name based on user level
  const getLevelName = (): string => {
    switch (user.level) {
      case 1:
        return t('levels.beginner');
      case 2:
        return t('levels.beginnerFoodie');
      case 3:
        return t('levels.regularFoodie');
      case 4:
        return t('levels.featuredFoodie');
      case 5:
        return t('levels.expertFoodie');
      case 6:
        return t('levels.topFoodie');
      default:
        return t('levels.beginner');
    }
  };
  
  // Progress bar animation
  const progressBarVariants = {
    hidden: { width: '0%' },
    visible: { 
      width: `${getLevelProgress()}%`,
      transition: { duration: 1, ease: 'easeOut' }
    }
  };
  
  // Next level goal
  const getNextLevelGoal = (): number => {
    switch (user.level) {
      case 1:
        return 7;
      case 2:
        return 50;
      case 3:
        return 100;
      case 4:
        return 250;
      case 5:
        return 500;
      case 6:
        return 1000; // Just for display
      default:
        return 7;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user.username.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.username}</h2>
          <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
            {t('profile.level', { level: user.level })} • {getLevelName()}
          </div>
        </div>
      </div>
      
      {/* Level progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>{user.points} {t('profile.points')}</span>
          <span>{getNextLevelGoal()} {t('profile.points')}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-500"
            variants={progressBarVariants}
            initial="hidden"
            animate="visible"
          />
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{user.points}</div>
          <div className="text-sm text-gray-500">{t('profile.points')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{user.uploads.length}</div>
          <div className="text-sm text-gray-500">{t('profile.contributions')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{user.reviews.length}</div>
          <div className="text-sm text-gray-500">{t('profile.reviews')}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;