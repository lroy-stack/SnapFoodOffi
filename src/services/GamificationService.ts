import { supabase } from './supabaseClient';
import { User, Badge, Activity, UserStats } from '../types';

/**
 * Points awarded for different activities
 */
export const ACTIVITY_POINTS = {
  REVIEW: 1,       // 1 point for adding a review
  COMMENT: 1,      // 1 point for adding a comment
  PHOTO: 5,        // 5 points for uploading a photo  
  SHARE: 2,        // 2 points for sharing the app
  VISIT: 1,        // 1 point for visiting a restaurant
  NEW_DISTRICT: 3, // 3 points for visiting a restaurant in a new district
};

/**
 * Level thresholds
 */
export const LEVEL_THRESHOLDS = {
  BEGINNER: 0,         // Beginner (0-6 points)
  BEGINNER_FOODIE: 7,  // Beginner Foodie (7-49 points)
  REGULAR_FOODIE: 50,  // Regular Foodie (50-99 points)
  FEATURED_FOODIE: 100, // Featured Foodie (100-249 points)
  EXPERT_FOODIE: 250,  // Expert Foodie (250-499 points)
  TOP_FOODIE: 500      // Top Foodie (500+ points)
};

/**
 * Badge categories
 */
export enum BadgeCategory {
  PHOTOGRAPHY = 'fotografie',
  COMMENTS = 'kommentare',
  RATINGS = 'bewertungen',
  EXPLORATION = 'erkundung',
  DISHES = 'gerichte'
}

class GamificationService {
  /**
   * Fetch user statistics
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('benutzer_statistik')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return {
      id: data.id,
      points: data.punkte,
      level: data.level,
      reviewsCount: data.bewertungen_anzahl,
      commentsCount: data.kommentare_anzahl,
      photosCount: data.fotos_anzahl,
      visitedRestaurants: data.besuchte_restaurants,
      triedDishes: data.probierte_gerichte,
      updatedAt: data.aktualisiert_am
    };
  }

  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('abzeichen_definitionen')
      .select('*');
    
    if (error || !data) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data.map(badge => ({
      id: badge.id,
      nameDE: badge.name_de,
      nameEN: badge.name_en,
      descriptionDE: badge.beschreibung_de,
      descriptionEN: badge.beschreibung_en,
      iconUrl: badge.icon_url,
      category: badge.kategorie,
      levelRequired: badge.level_erforderlich
    }));
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('benutzer_abzeichen')
      .select('abzeichen_id')
      .eq('benutzer_id', userId);
    
    if (error || !data) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data.map(badge => badge.abzeichen_id);
  }

  /**
   * Check for new badges based on user activity
   */
  async checkForBadges(userId: string): Promise<Badge[]> {
    // Get user statistics
    const stats = await this.getUserStats(userId);
    
    // Get all badges
    const allBadges = await this.getAllBadges();
    
    // Get user's earned badges
    const earnedBadgeIds = await this.getUserBadges(userId);
    
    // Find newly earned badges
    const newlyEarnedBadges: Badge[] = [];
    
    if (!stats) return newlyEarnedBadges;
    
    for (const badge of allBadges) {
      // Skip already earned badges
      if (earnedBadgeIds.includes(badge.id)) continue;
      
      // Skip badges that require higher level than user has
      if (badge.levelRequired > stats.level) continue;
      
      // Check badge conditions
      let isEarned = false;
      
      switch (badge.id) {
        // Photography badges
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
          
        // Ratings badges
        case 'first-rating':
          isEarned = stats.reviewsCount >= 1;
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
          
        // Other badges would have more complex logic based on specific data
        // from other tables, which we would implement similarly
      }
      
      if (isEarned) {
        // Award badge to user
        await this.awardBadge(userId, badge.id);
        newlyEarnedBadges.push(badge);
      }
    }
    
    return newlyEarnedBadges;
  }

  /**
   * Award a badge to a user
   */
  private async awardBadge(userId: string, badgeId: string): Promise<void> {
    const { error } = await supabase
      .from('benutzer_abzeichen')
      .insert({
        benutzer_id: userId,
        abzeichen_id: badgeId
      });
    
    if (error) {
      console.error('Error awarding badge:', error);
    }
  }

  /**
   * Log user activity and award points
   */
  async logActivity(userId: string, activity: Activity, additionalData?: any): Promise<number> {
    let pointsEarned = 0;
    
    // Determine points based on activity type
    switch (activity) {
      case 'review':
        pointsEarned = ACTIVITY_POINTS.REVIEW;
        break;
      case 'comment':
        pointsEarned = ACTIVITY_POINTS.COMMENT;
        break;
      case 'photo':
        pointsEarned = ACTIVITY_POINTS.PHOTO;
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
    
    // Points are automatically added in the database via triggers
    // This function is mainly for client-side feedback
    
    // Check for new badges
    await this.checkForBadges(userId);
    
    return pointsEarned;
  }

  /**
   * Get level name based on level number
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
   * Calculate progress to next level
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
        // At max level, show 100% progress
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
   * Calculate points needed for next level
   */
  getNextLevelThreshold(level: number): number {
    switch (level) {
      case 1: return LEVEL_THRESHOLDS.BEGINNER_FOODIE;
      case 2: return LEVEL_THRESHOLDS.REGULAR_FOODIE;
      case 3: return LEVEL_THRESHOLDS.FEATURED_FOODIE;
      case 4: return LEVEL_THRESHOLDS.EXPERT_FOODIE;
      case 5: return LEVEL_THRESHOLDS.TOP_FOODIE;
      case 6: return Infinity; // Already at max level
      default: return LEVEL_THRESHOLDS.BEGINNER_FOODIE;
    }
  }
}

export const gamificationService = new GamificationService();