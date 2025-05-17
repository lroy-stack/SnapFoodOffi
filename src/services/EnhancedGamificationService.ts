import { supabase } from './supabaseClient';
import { User, Badge, Activity, UserStats } from '../types';
import { authService } from './AuthService';

/**
 * Puntos otorgados por diferentes actividades
 */
export const ACTIVITY_POINTS = {
  REVIEW: 1,       // 1 punto por añadir una reseña
  COMMENT: 1,      // 1 punto por añadir un comentario
  PHOTO: 5,        // 5 puntos por subir una foto  
  SHARE: 2,        // 2 puntos por compartir la aplicación
  VISIT: 1,        // 1 punto por visitar un restaurante
  NEW_DISTRICT: 3, // 3 puntos por visitar un restaurante en un nuevo distrito
};

/**
 * Umbrales de nivel
 */
export const LEVEL_THRESHOLDS = {
  BEGINNER: 0,         // Principiante (0-6 puntos)
  BEGINNER_FOODIE: 7,  // Foodie Principiante (7-49 puntos)
  REGULAR_FOODIE: 50,  // Foodie Regular (50-99 puntos)
  FEATURED_FOODIE: 100, // Foodie Destacado (100-249 puntos)
  EXPERT_FOODIE: 250,  // Foodie Experto (250-499 puntos)
  TOP_FOODIE: 500      // Foodie Top (500+ puntos)
};

/**
 * Categorías de insignias
 */
export enum BadgeCategory {
  PHOTOGRAPHY = 'fotografie',
  COMMENTS = 'kommentare',
  RATINGS = 'bewertungen',
  EXPLORATION = 'erkundung',
  DISHES = 'gerichte'
}

/**
 * Servicio mejorado de gamificación que resuelve problemas de sincronización y registro
 * de actividades, garantizando un correcto funcionamiento incluso con problemas de red.
 */
class EnhancedGamificationService {
  private activityCache: Map<string, { type: Activity, data: any, timestamp: number }[]> = new Map();
  private lastSync: number = 0;
  private badgesCache: Badge[] = [];
  private userBadgesCache: Map<string, string[]> = new Map();
  private userStatsCache: Map<string, UserStats> = new Map();
  private isProcessing: boolean = false;
  
  // Frecuencia de sincronización en milisegundos (cada 30 segundos)
  private readonly SYNC_FREQUENCY = 30 * 1000;
  
  constructor() {
    // Iniciar proceso de sincronización periódica
    this.startPeriodicSync();
    
    // Cargar definiciones de insignias
    this.preloadBadgeDefinitions();
  }
  
  /**
   * Precargar definiciones de insignias en caché
   */
  async preloadBadgeDefinitions(): Promise<void> {
    try {
      const badges = await this.getAllBadges();
      this.badgesCache = badges;
      console.log('✅ Definiciones de insignias precargadas:', badges.length);
    } catch (error) {
      console.error('❌ Error al precargar definiciones de insignias:', error);
    }
  }
  
  /**
   * Iniciar proceso de sincronización periódica
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      this.syncCachedActivities().catch(error => {
        console.error('❌ Error en sincronización periódica:', error);
      });
    }, this.SYNC_FREQUENCY);
    
    // También sincronizar al descargar la página
    window.addEventListener('beforeunload', () => {
      this.syncCachedActivities();
    });
  }
  
  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    // Verificar caché
    if (this.userStatsCache.has(userId)) {
      const cachedStats = this.userStatsCache.get(userId)!;
      // Usar caché si es reciente (menos de 5 minutos)
      if (Date.now() - new Date(cachedStats.updatedAt || '').getTime() < 5 * 60 * 1000) {
        return cachedStats;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('benutzer_statistik')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        console.error('❌ Error al obtener estadísticas del usuario:', error);
        return null;
      }
      
      const userStats: UserStats = {
        userId: data.id,
        id: data.id,
        points: data.punkte,
        level: data.level,
        reviewsCount: data.bewertungen_anzahl || 0,
        commentsCount: data.kommentare_anzahl || 0,
        photosCount: data.fotos_anzahl || 0,
        visitedRestaurants: data.besuchte_restaurants || 0,
        districtsVisited: data.besuchte_bezirke || 0,
        triedDishes: data.probierte_gerichte || 0,
        updatedAt: data.aktualisiert_am
      };
      
      // Guardar en caché
      this.userStatsCache.set(userId, userStats);
      
      return userStats;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas del usuario:', error);
      return null;
    }
  }
  
  /**
   * Obtener todas las insignias disponibles
   */
  async getAllBadges(): Promise<Badge[]> {
    // Usar caché si está disponible
    if (this.badgesCache.length > 0) {
      return this.badgesCache;
    }
    
    try {
      const { data, error } = await supabase
        .from('abzeichen_definitionen')
        .select('*')
        .order('level_erforderlich', { ascending: true });
      
      if (error || !data) {
        console.error('❌ Error al obtener insignias:', error);
        return [];
      }
      
      const badges: Badge[] = data.map(badge => ({
        id: badge.id,
        nameDE: badge.name_de,
        nameEN: badge.name_en,
        descriptionDE: badge.beschreibung_de,
        descriptionEN: badge.beschreibung_en,
        iconUrl: badge.icon_url,
        category: badge.kategorie,
        levelRequired: badge.level_erforderlich
      }));
      
      // Guardar en caché
      this.badgesCache = badges;
      
      return badges;
    } catch (error) {
      console.error('❌ Error al obtener insignias:', error);
      return [];
    }
  }
  
  /**
   * Obtener las insignias ganadas por un usuario
   */
  async getUserBadges(userId: string): Promise<string[]> {
    // Verificar caché
    if (this.userBadgesCache.has(userId)) {
      return this.userBadgesCache.get(userId) || [];
    }
    
    try {
      const { data, error } = await supabase
        .from('benutzer_abzeichen')
        .select('abzeichen_id')
        .eq('benutzer_id', userId);
      
      if (error || !data) {
        console.error('❌ Error al obtener insignias del usuario:', error);
        return [];
      }
      
      const badgeIds = data.map(badge => badge.abzeichen_id);
      
      // Guardar en caché
      this.userBadgesCache.set(userId, badgeIds);
      
      return badgeIds;
    } catch (error) {
      console.error('❌ Error al obtener insignias del usuario:', error);
      return [];
    }
  }
  
  /**
   * Registrar actividad del usuario y otorgar puntos
   * Esta función ahora guarda en caché la actividad para garantizar que se procese eventualmente
   */
  async logActivity(userId: string, activity: Activity, additionalData?: any): Promise<number> {
    console.log(`🎮 Registrando actividad ${activity} para usuario ${userId}`, additionalData);
    
    // Determinar puntos según el tipo de actividad
    let pointsEarned = 0;
    
    switch (activity) {
      case 'review':
        pointsEarned = ACTIVITY_POINTS.REVIEW;
        break;
      case 'comment':
        pointsEarned = ACTIVITY_POINTS.COMMENT;
        break;
      case 'photo':
        pointsEarned = ACTIVITY_POINTS.PHOTO;
        console.log(`📸 Otorgando ${pointsEarned} puntos por foto`);
        break;
      case 'share':
        pointsEarned = ACTIVITY_POINTS.SHARE;
        break;
      case 'visit':
        pointsEarned = ACTIVITY_POINTS.VISIT;
        break;
      case 'new_district':
        pointsEarned = ACTIVITY_POINTS.NEW_DISTRICT;
        break;
    }
    
    // Guardar actividad en caché
    const activityRecord = {
      type: activity,
      data: additionalData || {},
      timestamp: Date.now(),
      points: pointsEarned
    };
    
    if (!this.activityCache.has(userId)) {
      this.activityCache.set(userId, []);
    }
    
    this.activityCache.get(userId)!.push(activityRecord as any);
    
    // Intentar sincronizar inmediatamente, pero no esperar el resultado
    this.syncCachedActivities().catch(error => {
      console.warn('⚠️ Error en sincronización inmediata, se reintentará más tarde:', error);
    });
    
    return pointsEarned;
  }
  
  /**
   * Sincronizar actividades en caché con el servidor
   */
  private async syncCachedActivities(): Promise<void> {
    // Evitar múltiples sincronizaciones simultáneas
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('🔄 No hay usuario autenticado para sincronizar actividades');
        return;
      }
      
      const userId = currentUser.id;
      const activities = this.activityCache.get(userId);
      
      if (!activities || activities.length === 0) {
        return;
      }
      
      console.log(`🔄 Sincronizando ${activities.length} actividades para el usuario ${userId}`);
      
      for (const activity of activities) {
        await this.processActivity(userId, activity.type, activity.data);
      }
      
      // Limpiar caché después de procesar todas las actividades
      this.activityCache.delete(userId);
      
      // Actualizar la caché del usuario después de sincronizar
      await this.refreshUserCaches(userId);
      
      // Registrar tiempo de última sincronización
      this.lastSync = Date.now();
      
      console.log(`✅ Sincronización completada para ${userId}`);
    } catch (error) {
      console.error('❌ Error en sincronización de actividades:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Procesar una sola actividad enviándola a la base de datos
   */
  private async processActivity(userId: string, activity: Activity, additionalData: any): Promise<void> {
    try {
      // Enviar la actividad a la base de datos
      const { error } = await supabase
        .from('benutzer_aktivitaeten')
        .insert({
          benutzer_id: userId,
          aktivitaet_typ: activity,
          daten: additionalData,
          // Los puntos y la actualización del nivel se manejan en la base de datos con triggers
          erstellt_am: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`❌ Error al procesar actividad ${activity}:`, error);
      throw error;
    }
  }
  
  /**
   * Actualizar todas las cachés relacionadas con el usuario
   */
  private async refreshUserCaches(userId: string): Promise<void> {
    try {
      // Limpiar cachés existentes para forzar recarga
      this.userStatsCache.delete(userId);
      this.userBadgesCache.delete(userId);
      
      // Recargar datos
      await this.getUserStats(userId);
      await this.getUserBadges(userId);
    } catch (error) {
      console.error('❌ Error al actualizar cachés del usuario:', error);
    }
  }
  
  /**
   * Verificar si el usuario ha calificado un número específico de platos de un tipo determinado
   */
  async checkSpecificDishTypeRatings(userId: string, dishType: string, count: number): Promise<boolean> {
    try {
      // Consultar reseñas del usuario que incluyan platos del tipo específico
      const { data, error } = await supabase
        .rpc('count_dish_ratings_by_type', { 
          user_id: userId, 
          dish_type: dishType 
        });
      
      if (error) {
        console.error(`❌ Error al verificar platos de tipo ${dishType}:`, error);
        return false;
      }
      
      // El procedimiento almacenado devuelve el número de platos calificados del tipo especificado
      return data >= count;
    } catch (error) {
      console.error(`❌ Error al verificar platos de tipo ${dishType}:`, error);
      return false;
    }
  }
  
  /**
   * Verificar si el usuario ha calificado al menos un plato de cada categoría
   */
  async checkAllDishCategories(userId: string): Promise<boolean> {
    try {
      // Consultar las categorías que el usuario ha calificado
      const { data, error } = await supabase
        .rpc('check_all_dish_categories', { 
          user_id: userId 
        });
      
      if (error) {
        console.error('❌ Error al verificar categorías de platos:', error);
        return false;
      }
      
      // El procedimiento almacenado devuelve true si el usuario ha calificado platos en todas las categorías
      return data === true;
    } catch (error) {
      console.error('❌ Error al verificar categorías de platos:', error);
      return false;
    }
  }
  
  /**
   * Verificar nuevas insignias basadas en la actividad del usuario
   */
  async checkForBadges(userId: string): Promise<Badge[]> {
    // Forzar sincronización antes de verificar insignias
    await this.syncCachedActivities();
    
    // Obtener estadísticas del usuario (forzando actualización desde DB)
    this.userStatsCache.delete(userId);
    const stats = await this.getUserStats(userId);
    
    // Obtener todas las insignias
    const allBadges = await this.getAllBadges();
    
    // Obtener insignias ya ganadas por el usuario
    const earnedBadgeIds = await this.getUserBadges(userId);
    
    // Encontrar nuevas insignias ganadas
    const newlyEarnedBadges: Badge[] = [];
    
    if (!stats) return newlyEarnedBadges;
    
    console.log(`🔍 Verificando insignias para usuario ${userId} (nivel: ${stats.level}, fotos: ${stats.photosCount})`);
    
    for (const badge of allBadges) {
      // Omitir insignias ya ganadas
      if (earnedBadgeIds.includes(badge.id)) {
        continue;
      }
      
      // Omitir insignias que requieren un nivel superior al que tiene el usuario
      if (badge.levelRequired > stats.level) {
        continue;
      }
      
      // Verificar condiciones de la insignia según su ID
      let isEarned = false;
      
      // Verificar si debe ganar esta insignia según su ID
      switch (badge.id) {
        // Insignias de fotografía
        case 'first-photo':
          isEarned = stats.photosCount >= 1;
          break;
        case 'food-photographer':
          isEarned = stats.photosCount >= 5;
          break;
        case 'visual-storyteller':
          isEarned = stats.photosCount >= 15;
          break;
        case 'photo-maestro':
          isEarned = stats.photosCount >= 30;
          break;
        case 'visual-legend':
          isEarned = stats.photosCount >= 50;
          break;
          
        // Insignias de calificaciones/reseñas
        case 'first-rating':
          isEarned = stats.reviewsCount >= 1;
          break;
        case 'good-foodie':
          isEarned = stats.reviewsCount >= 5;
          break;
        case 'star-giver':
          isEarned = stats.reviewsCount >= 10;
          break;
        case 'discerning-palate':
          isEarned = stats.reviewsCount >= 25;
          break;
        case 'rating-expert':
          isEarned = stats.reviewsCount >= 50;
          break;
        case 'star-collector':
          isEarned = stats.reviewsCount >= 100;
          break;
          
        // Insignias de comentarios
        case 'first-word':
          isEarned = (stats.commentsCount || 0) >= 1;
          break;
        case 'chatty-foodie':
          isEarned = (stats.commentsCount || 0) >= 6;
          break;
        case 'food-critic':
          isEarned = (stats.commentsCount || 0) >= 15;
          break;
        case 'review-master':
          isEarned = (stats.commentsCount || 0) >= 50;
          break;
        case 'eloquent-gourmet':
          isEarned = (stats.commentsCount || 0) >= 100;
          break;
          
        // Insignias de exploración
        case 'first-discovery':
          isEarned = (stats.visitedRestaurants || 0) >= 1;
          break;
        case 'district-traveler':
          isEarned = (stats.districtsVisited || 0) >= 3;
          break;
        case 'local-explorer':
          isEarned = (stats.districtsVisited || 0) >= 3;
          break;
        case 'city-navigator':
          isEarned = (stats.districtsVisited || 0) >= 10;
          break;
        case 'urban-legend':
          isEarned = (stats.visitedRestaurants || 0) >= 30;
          break;
          
        // Insignias de platos específicos
        case 'coffee-connoisseur':
          // Verificar si ha calificado 3 cafés vieneses
          isEarned = await this.checkSpecificDishTypeRatings(userId, 'kaffee', 3);
          break;
        case 'sweet-tooth':
          // Verificar si ha calificado 5 postres vieneses
          isEarned = await this.checkSpecificDishTypeRatings(userId, 'dessert', 5);
          break;
        case 'complete-menu':
          // Verificar si ha calificado un plato de cada categoría
          isEarned = await this.checkAllDishCategories(userId);
          break;
        case 'dessert-expert':
          // Verificar si ha calificado 10 postres diferentes
          isEarned = await this.checkSpecificDishTypeRatings(userId, 'dessert', 10);
          break;
        case 'schnitzel-lover':
          // Verificar si ha probado 5 schnitzels diferentes
          isEarned = await this.checkSpecificDishTypeRatings(userId, 'schnitzel', 5);
          break;
        case 'goulash-guru':
          // Verificar si ha calificado 3 platos de gulash
          isEarned = await this.checkSpecificDishTypeRatings(userId, 'gulasch', 3);
          break;
      }
      
      if (isEarned) {
        console.log(`✅ Usuario ${userId} ha ganado la insignia ${badge.id}`);
        // Otorgar insignia al usuario
        await this.awardBadge(userId, badge.id);
        newlyEarnedBadges.push(badge);
      }
    }
    
    // Actualizar la caché de insignias del usuario si se ganaron nuevas
    if (newlyEarnedBadges.length > 0) {
      this.userBadgesCache.delete(userId); // Forzar actualización en próxima consulta
    }
    
    return newlyEarnedBadges;
  }
  
  /**
   * Otorgar una insignia a un usuario
   */
  private async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      // Verificar si ya tiene la insignia para evitar duplicados
      const { data, error: checkError } = await supabase
        .from('benutzer_abzeichen')
        .select('id')
        .eq('benutzer_id', userId)
        .eq('abzeichen_id', badgeId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no encontrado (esperado)
        console.error('❌ Error al verificar si el usuario ya tiene la insignia:', checkError);
      }
      
      // Si ya tiene la insignia, no hacer nada
      if (data) {
        console.log(`⚠️ Usuario ${userId} ya tiene la insignia ${badgeId}`);
        return;
      }
      
      // Otorgar nueva insignia
      const { error } = await supabase
        .from('benutzer_abzeichen')
        .insert({
          benutzer_id: userId,
          abzeichen_id: badgeId,
          erhalten_am: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`🏆 Insignia ${badgeId} otorgada a usuario ${userId}`);
    } catch (error) {
      console.error(`❌ Error al otorgar insignia ${badgeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtener nombre del nivel según el número de nivel
   */
  getLevelName(level: number, language: 'de' | 'en'): string {
    if (language === 'de') {
      switch (level) {
        case 1: return 'Anfänger';
        case 2: return 'Beginner Foodie';
        case 3: return 'Regular Foodie';
        case 4: return 'Featured Foodie';
        case 5: return 'Expert Foodie';
        case 6: return 'Top Foodie';
        default: return 'Anfänger';
      }
    } else {
      switch (level) {
        case 1: return 'Beginner';
        case 2: return 'Beginner Foodie';
        case 3: return 'Regular Foodie';
        case 4: return 'Featured Foodie';
        case 5: return 'Expert Foodie';
        case 6: return 'Top Foodie';
        default: return 'Beginner';
      }
    }
  }
  
  /**
   * Calcular progreso hacia el siguiente nivel
   */
  calculateLevelProgress(points: number, level: number): number {
    let nextLevelThreshold: number;
    let currentLevelThreshold: number;
    
    switch (level) {
      case 1:
        currentLevelThreshold = LEVEL_THRESHOLDS.BEGINNER;
        nextLevelThreshold = LEVEL_THRESHOLDS.BEGINNER_FOODIE;
        break;
      case 2:
        currentLevelThreshold = LEVEL_THRESHOLDS.BEGINNER_FOODIE;
        nextLevelThreshold = LEVEL_THRESHOLDS.REGULAR_FOODIE;
        break;
      case 3:
        currentLevelThreshold = LEVEL_THRESHOLDS.REGULAR_FOODIE;
        nextLevelThreshold = LEVEL_THRESHOLDS.FEATURED_FOODIE;
        break;
      case 4:
        currentLevelThreshold = LEVEL_THRESHOLDS.FEATURED_FOODIE;
        nextLevelThreshold = LEVEL_THRESHOLDS.EXPERT_FOODIE;
        break;
      case 5:
        currentLevelThreshold = LEVEL_THRESHOLDS.EXPERT_FOODIE;
        nextLevelThreshold = LEVEL_THRESHOLDS.TOP_FOODIE;
        break;
      case 6:
        // Al nivel máximo, mostrar progreso del 100%
        return 100;
      default:
        currentLevelThreshold = 0;
        nextLevelThreshold = LEVEL_THRESHOLDS.BEGINNER_FOODIE;
    }
    
    const pointsInLevel = points - currentLevelThreshold;
    const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
    const progress = (pointsInLevel / pointsNeededForNextLevel) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  }
  
  /**
   * Calcular puntos necesarios para el siguiente nivel
   */
  getNextLevelThreshold(level: number): number {
    switch (level) {
      case 1: return LEVEL_THRESHOLDS.BEGINNER_FOODIE;
      case 2: return LEVEL_THRESHOLDS.REGULAR_FOODIE;
      case 3: return LEVEL_THRESHOLDS.FEATURED_FOODIE;
      case 4: return LEVEL_THRESHOLDS.EXPERT_FOODIE;
      case 5: return LEVEL_THRESHOLDS.TOP_FOODIE;
      case 6: return Infinity; // Ya en el nivel máximo
      default: return LEVEL_THRESHOLDS.BEGINNER_FOODIE;
    }
  }
}

export const enhancedGamificationService = new EnhancedGamificationService();
export default enhancedGamificationService;
