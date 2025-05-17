import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { gamificationService } from '../services/GamificationService';
import gamificationFallbackService from '../services/GamificationFallbackService';
import enhancedGamificationService from '../services/EnhancedGamificationService';
import { useConnectionStatus } from '../services/ConnectionService';
import { Badge, UserStats, Activity } from '../types';
import { AlertTriangle } from 'lucide-react';

interface GamificationContextType {
  userStats: UserStats | null;
  allBadges: Badge[];
  earnedBadgeIds: string[];
  isLoading: boolean;
  error: string | null;
  usingFallbackData: boolean;
  logActivity: (activity: Activity, additionalData?: any) => Promise<void>;
  getProgress: () => number;
  getNextLevelThreshold: () => number;
  refreshStats: () => Promise<void>;
  getLevelName: (language: 'de' | 'en') => string;
}

export const GamificationContext = createContext<GamificationContextType>({
  userStats: null,
  allBadges: [],
  earnedBadgeIds: [],
  isLoading: true,
  error: null,
  usingFallbackData: false,
  logActivity: async () => {},
  getProgress: () => 0,
  getNextLevelThreshold: () => 0,
  refreshStats: async () => {},
  getLevelName: () => '',
});

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  // Usar AuthContext para información de autenticación confiable
  const { user, isAuthenticated } = useContext(AuthContext);
  // Mantener UserContext por compatibilidad con código existente
  const { user: userFromUserContext, isLoggedIn } = useContext(UserContext);
  const { isConnected } = useConnectionStatus();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [newPoints, setNewPoints] = useState<number | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // Usar cuentas de autenticación en orden de prioridad
  const activeUser = user || userFromUserContext;
  const isActive = isAuthenticated || isLoggedIn;

  // Cargar datos de gamificación cuando el usuario inicia sesión
  useEffect(() => {
    if (isActive && activeUser) {
      loadGamificationData();
    } else {
      resetGamificationState();
    }
  }, [isActive, activeUser, isConnected]);

  const resetGamificationState = () => {
    setUserStats(null);
    setAllBadges([]);
    setEarnedBadgeIds([]);
    setError(null);
    setUsingFallbackData(false);
  };

  const loadGamificationData = async () => {
    if (!activeUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isConnected) {
        console.log('⚠️ Sin conexión a base de datos, usando datos de respaldo para gamificación');
        loadFallbackData();
        return;
      }
      
      // Intentar cargar estadísticas del usuario desde el servicio mejorado
      console.log('🔍 Cargando estadísticas de gamificación desde el servicio mejorado...');
      const stats = await enhancedGamificationService.getUserStats(activeUser.id);
      
      if (stats) {
        console.log('✅ Estadísticas cargadas correctamente');
        setUserStats(stats);
        setUsingFallbackData(false);
        
        // Cargar todos los insignias
        const badges = await enhancedGamificationService.getAllBadges();
        setAllBadges(badges);
        
        // Cargar insignias del usuario
        const earnedBadges = await enhancedGamificationService.getUserBadges(activeUser.id);
        setEarnedBadgeIds(earnedBadges);
      } else {
        console.log('⚠️ No se encontraron estadísticas, usando respaldo');
        loadFallbackData();
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de gamificación:', error);
      setError('Error al cargar tus estadísticas de gamificación');
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos de respaldo cuando falla el servicio principal
  const loadFallbackData = () => {
    if (!activeUser) return;
    
    try {
      console.log('📊 Generando estadísticas de respaldo para gamificación');
      
      // Generar estadísticas de respaldo
      const fallbackStats = gamificationFallbackService.generateFallbackStats(activeUser);
      setUserStats(fallbackStats);
      
      // Usar insignias de respaldo como todas las insignias
      setAllBadges(fallbackStats.badges);
      
      // Las insignias ganadas son los IDs de las insignias en las estadísticas
      setEarnedBadgeIds(fallbackStats.badges.map(badge => badge.id));
      
      // Marcar que estamos usando datos de respaldo
      setUsingFallbackData(true);
      setError('Mostrando estadísticas temporales. Algunas funciones pueden estar limitadas.');
    } catch (fallbackError) {
      console.error('❌ Error al generar datos de respaldo:', fallbackError);
      setError('No se pudieron cargar tus estadísticas en este momento');
    }
  };

  const logActivity = async (activity: Activity, additionalData?: any): Promise<void> => {
    if (!activeUser) return;
    
    try {
      // Registrar actividad con servicio mejorado aunque estemos en modo fallback
      // El servicio mejorado gestiona el almacenamiento en caché y la sincronización
      const points = await enhancedGamificationService.logActivity(activeUser.id, activity, additionalData);
      
      console.log(`🎮 Actividad ${activity} registrada: +${points} puntos`);
      
      // Mostrar notificación de puntos
      if (points > 0) {
        setNewPoints(points);
        setTimeout(() => setNewPoints(null), 3000);
      }
      
      // Actualizar estadísticas
      await refreshStats();
    } catch (error) {
      console.error('❌ Error al registrar actividad:', error);
    }
  };

  const refreshStats = async (): Promise<void> => {
    if (!activeUser) return;
    
    setIsLoading(true);
    
    try {
      if (!isConnected) {
        // Si no hay conexión, usar datos de respaldo
        loadFallbackData();
        return;
      }
      
      // Intentar usar servicio mejorado primero
      const stats = await enhancedGamificationService.getUserStats(activeUser.id);
      
      if (stats) {
        console.log('✅ Estadísticas mejoradas cargadas correctamente');
        setUserStats(stats);
        setUsingFallbackData(false);
        
        // Cargar todas las insignias usando servicio mejorado
        const badges = await enhancedGamificationService.getAllBadges();
        setAllBadges(badges);
        
        // Cargar insignias del usuario
        const earnedBadges = await enhancedGamificationService.getUserBadges(activeUser.id);
        setEarnedBadgeIds(earnedBadges);
        
        // Verificar nuevas insignias
        const newBadges = await enhancedGamificationService.checkForBadges(activeUser.id);
        if (newBadges && newBadges.length > 0) {
          // Mostrar notificación para la primera insignia nueva
          setNewBadge(newBadges[0]);
          setTimeout(() => setNewBadge(null), 5000);
        }
      } else {
        // Si no hay datos en el servicio mejorado, usar respaldo
        loadFallbackData();
      }
    } catch (error) {
      console.error('❌ Error al actualizar estadísticas:', error);
      // Si falla, intentar usar datos de respaldo
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = (): number => {
    if (!userStats) return 0;
    
    if (usingFallbackData && userStats.progressPercentage !== undefined) {
      // Usar cálculo directo de los datos de respaldo
      return userStats.progressPercentage;
    }
    
    // Usar cálculo del servicio mejorado
    return enhancedGamificationService.calculateLevelProgress(userStats.points, userStats.level);
  };

  const getNextLevelThreshold = (): number => {
    if (!userStats) return 0;
    
    if (usingFallbackData && userStats.nextLevelPoints !== undefined) {
      // Usar el valor directo de los datos de respaldo
      return userStats.nextLevelPoints;
    }
    
    // Usar cálculo del servicio mejorado
    return enhancedGamificationService.getNextLevelThreshold(userStats.level);
  };

  const getLevelName = (language: 'de' | 'en'): string => {
    if (!userStats) return '';
    
    // Nombres de nivel simplificados para modo de respaldo
    if (usingFallbackData) {
      const levelNames = {
        de: [
          'Anfänger', 'Entdecker', 'Kenner', 
          'Experte', 'Meister', 'Legende'
        ],
        en: [
          'Beginner', 'Explorer', 'Connoisseur',
          'Expert', 'Master', 'Legend'
        ]
      };
      
      const index = Math.min(userStats.level - 1, levelNames[language].length - 1);
      return levelNames[language][index];
    }
    
    // Usar nombres del servicio mejorado de gamificación
    return enhancedGamificationService.getLevelName(userStats.level, language);
  };

  return (
    <GamificationContext.Provider
      value={{
        userStats,
        allBadges,
        earnedBadgeIds,
        isLoading,
        error,
        usingFallbackData,
        logActivity,
        getProgress,
        getNextLevelThreshold,
        refreshStats,
        getLevelName,
      }}
    >
      {children}
      
      {/* Notificación de modo de respaldo */}
      {usingFallbackData && (
        <div className="fixed bottom-16 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-2 text-xs text-center text-yellow-800 flex items-center justify-center z-20">
          <AlertTriangle size={12} className="inline-block mr-1" />
          Modo de gamificación limitado. Algunas funciones no están disponibles.
        </div>
      )}
      
      {/* Notificación de puntos */}
      {newPoints && (
        <div className="fixed top-20 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg animate-bounce">
          +{newPoints} Punkte!
        </div>
      )}
      
      {/* Notificación de insignia */}
      {newBadge && (
        <div className="fixed bottom-24 left-4 right-4 bg-white border-l-4 border-gold p-4 rounded-lg shadow-lg z-50 flex items-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
            <span className="text-xl">{newBadge.category === 'fotografie' ? '📸' : 
              newBadge.category === 'kommentare' ? '💬' : 
              newBadge.category === 'bewertungen' ? '⭐' : 
              newBadge.category === 'erkundung' ? '🗺️' : '🍽️'}</span>
          </div>
          <div>
            <h3 className="font-bold">Neues Abzeichen freigeschaltet!</h3>
            <p>{newBadge.nameDE}</p>
          </div>
        </div>
      )}
    </GamificationContext.Provider>
  );
};

export default GamificationProvider;
