import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectionStatus, ConnectionStatus as ConnStatus, ConnectionReason } from '../../services/ConnectionService';

const ConnectionStatus: React.FC = () => {
  const { t } = useTranslation();
  const { 
    status, 
    reason, 
    isConnected, 
    isDisconnected, 
    reconnect 
  } = useConnectionStatus();
  
  const [showStatus, setShowStatus] = useState(false);
  
  // Mostrar estado en cambios
  useEffect(() => {
    if (isDisconnected) {
      setShowStatus(true);
    } else if (isConnected) {
      // Mostrar brevemente y luego ocultar
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, isDisconnected]);
  
  // No mostrar nada si no hay estado o si está oculto
  if (!showStatus) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isConnected ? (
        <motion.div 
          className="fixed bottom-20 right-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg shadow-md border border-green-100 flex items-center z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-green-100 p-1.5 rounded-full mr-2">
            <Wifi className="text-green-600" size={14} />
          </div>
          <span className="text-sm font-medium">{t('connection.connected')}</span>
          <button 
            onClick={() => setShowStatus(false)} 
            className="ml-2 p-1 rounded-full hover:bg-green-100 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} className="text-green-600" />
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="fixed bottom-20 right-4 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow-md border border-red-100 flex items-center z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-100 p-1.5 rounded-full mr-2">
            <WifiOff className="text-red-600" size={14} />
          </div>
          <span className="text-sm font-medium mr-2">
            {reason === ConnectionReason.DB 
              ? t('connection.dbError') 
              : reason === ConnectionReason.NETWORK 
                ? t('connection.networkError') 
                : t('connection.unknownError')}
          </span>
          <button 
            onClick={reconnect} 
            className="p-1 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Reconnect"
          >
            <RefreshCcw size={14} className="text-red-600" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
