import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Wifi, WifiOff, Loader, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectionStatus, ConnectionStatus, ConnectionReason } from '../../services/ConnectionService';

interface ConnectionManagerProps {
  showAlways?: boolean;  // Si es true, siempre muestra el componente. Por defecto, solo cuando hay problemas.
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ showAlways = false }) => {
  const { t } = useTranslation();
  const { 
    status, 
    reason, 
    isConnected, 
    isDisconnected, 
    isInitializing, 
    isReconnecting,
    reconnect 
  } = useConnectionStatus();
  
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  
  // Determinar si el componente debe renderizarse
  useEffect(() => {
    if (showAlways) {
      setShouldRender(true);
      return;
    }
    
    // Solo renderizar si está desconectado, reconectando o inicializando
    if (isDisconnected || isReconnecting || isInitializing) {
      setShouldRender(true);
      setVisible(true);
    } else if (isConnected) {
      // Cuando se conecta, ocultar después de un breve delay
      setTimeout(() => {
        setVisible(false);
        // Una vez completada la animación de salida, dejar de renderizar
        setTimeout(() => {
          setShouldRender(false);
        }, 500);
      }, 2000);
    }
  }, [isConnected, isDisconnected, isReconnecting, isInitializing, showAlways]);

  // No renderizar si no es necesario
  if (!shouldRender) {
    return null;
  }
  
  // Determinar el estilo basado en el estado de conexión
  const getStyles = () => {
    if (isConnected) 
      return 'bg-green-50 border-green-200 text-green-700';
    if (isReconnecting || isInitializing)
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-red-50 border-red-200 text-red-700';
  };
  
  // Mensaje según el estado de la conexión
  const getMessage = () => {
    if (isConnected) return t('connection.connected', 'Conexión establecida');
    if (isInitializing) return t('connection.initializing', 'Inicializando conexión...');
    if (isReconnecting) return t('connection.reconnecting', 'Reconectando...');
    
    // Diferentes mensajes para diferentes razones de error
    switch (reason) {
      case ConnectionReason.NETWORK:
        return t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet');
      case ConnectionReason.AUTH:
        return t('connection.authError', 'Error de autenticación. Inicia sesión nuevamente');
      case ConnectionReason.DB:
        return t('connection.dbError', 'Error al conectar con la base de datos');
      case ConnectionReason.TIMEOUT:
        return t('connection.timeoutError', 'Tiempo de espera agotado para la conexión');
      default:
        return t('connection.unknownError', 'Error de conexión desconocido');
    }
  };
  
  // Icono según el estado
  const getIcon = () => {
    if (isConnected) return <Wifi className="h-5 w-5 text-green-500" />;
    if (isReconnecting || isInitializing) return <Loader className="h-5 w-5 text-yellow-500 animate-spin" />;
    if (reason === ConnectionReason.NETWORK) return <WifiOff className="h-5 w-5 text-red-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 right-0 left-0 z-50 m-4 p-3 rounded-md shadow-md border flex items-center justify-between ${getStyles()}`}
        >
          <div className="flex items-center">
            <div className="mr-3">
              {getIcon()}
            </div>
            <div>
              <p className="font-medium">{getMessage()}</p>
              {(status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) && (
                <p className="text-sm opacity-80">
                  {t('connection.tryingReconnect', 'Intentando reconectar automáticamente...')}
                </p>
              )}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex space-x-2">
            {(status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) && (
              <button
                onClick={() => reconnect()}
                className="flex items-center bg-white bg-opacity-20 px-3 py-1.5 rounded hover:bg-opacity-30 transition"
              >
                <RefreshCcw className="h-4 w-4 mr-1" />
                {t('connection.reconnect', 'Reconectar')}
              </button>
            )}
            
            <button
              onClick={() => setVisible(false)}
              className="px-3 py-1.5 rounded hover:bg-white hover:bg-opacity-20 transition"
            >
              {t('common.dismiss', 'Cerrar')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionManager;
