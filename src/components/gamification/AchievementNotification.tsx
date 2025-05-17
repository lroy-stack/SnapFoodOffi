import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../types';

interface PointNotificationProps {
  points: number;
  visible: boolean;
  onClose: () => void;
}

export const PointNotification: React.FC<PointNotificationProps> = ({ points, visible, onClose }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed top-20 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-2">🎉</span>
            <div>
              <p className="font-bold">+{points} Punkte!</p>
              <p className="text-sm">Gut gemacht!</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface BadgeNotificationProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, visible, onClose }) => {
  if (!badge) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed bottom-24 inset-x-4 bg-white border border-yellow-500 rounded-lg shadow-lg z-50"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <span className="text-3xl">{
                  badge.category === 'fotografie' ? '📸' : 
                  badge.category === 'kommentare' ? '💬' : 
                  badge.category === 'bewertungen' ? '⭐' : 
                  badge.category === 'erkundung' ? '🗺️' : '🍽️'
                }</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Neues Abzeichen freigeschaltet!</h3>
                <p className="text-yellow-700 font-medium">{badge.nameDE}</p>
                <p className="text-sm text-gray-600 mt-1">{badge.descriptionDE}</p>
              </div>
            </div>
            
            <motion.div 
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, backgroundColor: '#e5e7eb' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <span className="text-gray-500 text-xs">✕</span>
            </motion.div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-b-lg border-t border-yellow-100">
            <p className="text-sm text-center text-yellow-700">
              Sammle weitere Abzeichen, um dein Level zu erhöhen!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LevelUpNotificationProps {
  newLevel: number | null;
  levelName: string;
  visible: boolean;
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({ 
  newLevel, levelName, visible, onClose 
}) => {
  if (!newLevel) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto mb-4"
              >
                <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                  {newLevel}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-2">Level aufgestiegen!</h2>
                <p className="text-lg text-red-600 font-medium mb-4">{levelName}</p>
                <p className="text-gray-600 mb-6">
                  Glückwunsch! Du hast ein neues Level erreicht. Mach weiter so!
                </p>
                
                <motion.button
                  className="bg-red-600 text-white py-2 px-6 rounded-full font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                >
                  Weiter
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};