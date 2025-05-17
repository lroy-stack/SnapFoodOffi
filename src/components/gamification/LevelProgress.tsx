import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LanguageContext } from '../../context/LanguageContext';
import { GamificationContext } from '../../contexts/GamificationContext';

interface LevelProgressProps {
  compact?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { userStats, isLoading, getProgress, getNextLevelThreshold, getLevelName } = useContext(GamificationContext);

  if (isLoading || !userStats) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 opacity-75"></div>
      </div>
    );
  }

  const progress = getProgress();
  const nextLevelThreshold = getNextLevelThreshold();
  const levelName = getLevelName(language);
  
  // Progress bar animation
  const progressBarVariants = {
    hidden: { width: '0%' },
    visible: { 
      width: `${progress}%`,
      transition: { duration: 1, ease: 'easeOut' }
    }
  };

  if (compact) {
    return (
      <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-semibold tracking-wide text-gray-900">{t('profile.level', { level: userStats.level })}</span>
          <span className="text-red-600 font-medium">{levelName}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
            variants={progressBarVariants}
            initial="hidden"
            animate="visible"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
      <div className="flex items-center mb-5">
        <motion.div 
          className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {userStats.level}
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">{levelName}</h3>
          <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-red-200">
            {userStats.points.toLocaleString()} {t('profile.points')}
          </div>
        </div>
      </div>
      
      {/* Level progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-700">{userStats.points.toLocaleString()} {t('profile.points')}</span>
          <span className="font-medium text-gray-700">{nextLevelThreshold.toLocaleString()} {t('profile.points')}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
            variants={progressBarVariants}
            initial="hidden"
            animate="visible"
          />
        </div>
      </div>
      
      {/* Next level info */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex items-center justify-center"
      >
        <div className="text-sm font-medium px-4 py-2 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 shadow-sm">
          {language === 'de' 
            ? `${(nextLevelThreshold - userStats.points).toLocaleString()} Punkte bis zum nächsten Level`
            : `${(nextLevelThreshold - userStats.points).toLocaleString()} points until next level`
          }
        </div>
      </motion.div>
    </div>
  );
};

export default LevelProgress;
