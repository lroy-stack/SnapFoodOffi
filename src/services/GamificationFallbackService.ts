import { User } from '@supabase/supabase-js';
import { Badge } from '../types';

/**
 * Interfaz para estadísticas de usuario en gamificación
 */
export interface UserStats {
  userId: string;
  level: number;
  points: number;
  badges: Badge[];
  badgeCount: number;
  reviewsCount: number;
  photosCount: number;
  districtsVisited: number;
  nextLevelPoints: number;
  progressPercentage: number;
}

/**
 * Servicio para proporcionar datos de gamificación cuando
 * la base de datos no está disponible o hay errores de conexión
 */
class GamificationFallbackService {
  // Cache de estadísticas por usuario
  private statsCache = new Map<string, UserStats>();
  
  // Badges de ejemplo para respaldo
  private fallbackBadges: Badge[] = [
    {
      id: 'first-photo',
      nameDE: 'Erster Schnappschuss',
      nameEN: 'First Snap',
      descriptionDE: 'Dein erstes Foto hochgeladen',
      descriptionEN: 'Uploaded your first photo',
      iconUrl: '/badges/first-snap.svg',
      category: 'fotografie',
      levelRequired: 1
    },
    {
      id: 'good-foodie',
      nameDE: 'Guter Foodie',
      nameEN: 'Good Foodie',
      descriptionDE: 'Mehr als 5 Bewertungen abgegeben',
      descriptionEN: 'Submitted more than 5 ratings',
      iconUrl: '/badges/good-foodie.svg',
      category: 'bewertungen',
      levelRequired: 2
    },
    {
      id: 'local-explorer',
      nameDE: 'Lokaler Entdecker',
      nameEN: 'Local Explorer',
      descriptionDE: 'Mehr als 3 Bezirke besucht',
      descriptionEN: 'Visited more than 3 districts',
      iconUrl: '/badges/local-explorer.svg',
      category: 'erkundung',
      levelRequired: 2
    }
  ];
  
  /**
   * Genera estadísticas de gamificación para un usuario
   */
  generateFallbackStats(user: User): UserStats {
    // Verificar si ya tenemos estadísticas en caché para este usuario
    if (this.statsCache.has(user.id)) {
      return this.statsCache.get(user.id)!;
    }
    
    console.log('🎮 Generando estadísticas de gamificación para:', user.email);
    
    // Generar nivel basado en la antigüedad de la cuenta
    const accountAgeMs = Date.now() - new Date(user.created_at || Date.now()).getTime();
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
    
    // Calcular nivel: nuevo usuario comienza en nivel 1, aumenta con el tiempo
    const level = Math.min(6, Math.max(1, Math.floor(accountAgeDays / 7) + 1));
    
    // Calcular puntos: 10-20 por día de antigüedad
    const basePoints = accountAgeDays * (10 + Math.floor(Math.random() * 10));
    const points = Math.min(500, Math.floor(basePoints));
    
    // Crear estadísticas simuladas
    const stats: UserStats = {
      userId: user.id,
      level,
      points,
      badges: this.getRelevantBadges(level),
      badgeCount: Math.min(level + 1, this.fallbackBadges.length),
      reviewsCount: Math.floor(points / 25),
      photosCount: Math.floor(points / 50),
      districtsVisited: Math.min(23, Math.floor(points / 80)),
      nextLevelPoints: this.calculateNextLevelPoints(level),
      progressPercentage: this.calculateProgressPercentage(points, level)
    };
    
    // Guardar en caché
    this.statsCache.set(user.id, stats);
    
    return stats;
  }
  
  /**
   * Obtiene insignias relevantes según el nivel del usuario
   */
  private getRelevantBadges(level: number): Badge[] {
    return this.fallbackBadges.filter(badge => badge.levelRequired <= level);
  }
  
  /**
   * Calcula los puntos necesarios para el siguiente nivel
   */
  private calculateNextLevelPoints(currentLevel: number): number {
    switch (currentLevel) {
      case 1: return 7;
      case 2: return 50;
      case 3: return 100;
      case 4: return 250;
      case 5: return 500;
      default: return 1000;
    }
  }
  
  /**
   * Calcula el porcentaje de progreso hacia el siguiente nivel
   */
  private calculateProgressPercentage(points: number, level: number): number {
    const currentLevelMinPoints = this.getPreviousLevelPoints(level);
    const nextLevelPoints = this.calculateNextLevelPoints(level);
    const levelPoints = points - currentLevelMinPoints;
    const totalLevelPoints = nextLevelPoints - currentLevelMinPoints;
    
    return Math.min(100, Math.max(0, Math.floor((levelPoints / totalLevelPoints) * 100)));
  }
  
  /**
   * Obtiene los puntos mínimos del nivel anterior
   */
  private getPreviousLevelPoints(level: number): number {
    switch (level) {
      case 1: return 0;
      case 2: return 7;
      case 3: return 50;
      case 4: return 100;
      case 5: return 250;
      case 6: return 500;
      default: return 0;
    }
  }
}

// Exportar una única instancia
export const gamificationFallbackService = new GamificationFallbackService();
export default gamificationFallbackService;
