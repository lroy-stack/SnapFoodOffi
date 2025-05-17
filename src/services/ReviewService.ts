import { supabase } from './supabaseClient';
import { storageService } from './StorageService';
import i18n from '../utils/i18n';

/**
 * Service for handling reviews and photos
 * 
 * Dienst für die Verwaltung von Bewertungen und Fotos
 */
class ReviewService {
  /**
   * Creates a new review with optional photo
   * @param userId User ID
   * @param dishId Dish ID
   * @param restaurantId Restaurant ID
   * @param rating Rating (1-5)
   * @param comment Optional comment
   * @param photoFile Optional photo file
   * @returns Object with success status and optional error message
   */
  async createReview(
    userId: string,
    dishId: string,
    restaurantId: string, 
    rating: number,
    comment?: string,
    photoFile?: File | null
  ): Promise<{ success: boolean; reviewId?: string; photoUrl?: string; error?: string }> {
    try {
      let photoUrl: string | null = null;
      
      // Upload photo if provided
      if (photoFile) {
        console.log(i18n.language === 'de' 
          ? '📸 Foto wird hochgeladen...' 
          : '📸 Uploading photo...');
        
        // Create a unique filename
        const fileName = `review_${userId}_${Date.now()}.${photoFile.name.split('.').pop() || 'jpg'}`;
        
        // Upload to 'fotos' bucket using StorageService
        photoUrl = await storageService.uploadFile(photoFile, 'fotos', fileName);
        
        if (!photoUrl) {
          console.error(i18n.language === 'de' 
            ? '❌ Fehler beim Hochladen des Fotos' 
            : '❌ Error uploading photo');
          return { 
            success: false, 
            error: i18n.language === 'de' 
              ? 'Foto konnte nicht hochgeladen werden' 
              : 'Could not upload photo' 
          };
        }
        
        console.log(i18n.language === 'de' 
          ? '✅ Foto erfolgreich hochgeladen' 
          : '✅ Photo uploaded successfully');
      }
      
      // Create review
      const reviewData = {
        benutzer_id: userId,
        gericht_id: dishId,
        restaurant_id: restaurantId,
        bewertung: rating,
        kommentar: comment || null,
        foto_url: photoUrl,
        erstellt_am: new Date().toISOString(),
        aktualisiert_am: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('bewertungen')
        .insert(reviewData)
        .select('id')
        .single();
      
      if (error) {
        console.error(i18n.language === 'de' 
          ? '❌ Fehler beim Speichern der Bewertung:' 
          : '❌ Error saving review:', 
          error);
        
        // If the bewertungen table doesn't have foto_url column yet,
        // try two-step process (compatibility with older DB schema)
        if (error.message?.includes('column "foto_url" does not exist')) {
          return await this.createReviewLegacy(userId, dishId, restaurantId, rating, comment, photoUrl);
        }
        
        return { 
          success: false, 
          error: i18n.language === 'de' 
            ? 'Bewertung konnte nicht gespeichert werden' 
            : 'Could not save review' 
        };
      }
      
      console.log(i18n.language === 'de' 
        ? '✅ Bewertung erfolgreich gespeichert' 
        : '✅ Review saved successfully');
      
      return { 
        success: true,
        reviewId: data?.id,
        photoUrl: photoUrl || undefined
      };
    } catch (error) {
      console.error(i18n.language === 'de' 
        ? '❌ Unerwarteter Fehler bei createReview:' 
        : '❌ Unexpected error in createReview:', 
        error);
      
      return { 
        success: false, 
        error: i18n.language === 'de' 
          ? 'Ein unerwarteter Fehler ist aufgetreten' 
          : 'An unexpected error occurred'
      };
    }
  }
  
  /**
   * Legacy method to create review when the bewertungen table doesn't have foto_url column
   * @param userId User ID
   * @param dishId Dish ID
   * @param restaurantId Restaurant ID
   * @param rating Rating (1-5)
   * @param comment Optional comment
   * @param photoUrl Optional photo URL
   */
  private async createReviewLegacy(
    userId: string,
    dishId: string,
    restaurantId: string,
    rating: number,
    comment?: string,
    photoUrl?: string | null
  ): Promise<{ success: boolean; reviewId?: string; photoUrl?: string; error?: string }> {
    try {
      // Step 1: Create review without photo
      const reviewData = {
        benutzer_id: userId,
        gericht_id: dishId,
        restaurant_id: restaurantId,
        bewertung: rating,
        kommentar: comment || null,
        erstellt_am: new Date().toISOString(),
        aktualisiert_am: new Date().toISOString()
      };
      
      const { data: reviewResult, error: reviewError } = await supabase
        .from('bewertungen')
        .insert(reviewData)
        .select('id')
        .single();
      
      if (reviewError || !reviewResult) {
        console.error(i18n.language === 'de' 
          ? '❌ Fehler beim Speichern der Bewertung (Legacy):' 
          : '❌ Error saving review (Legacy):', 
          reviewError);
        
        return { 
          success: false, 
          error: i18n.language === 'de' 
            ? 'Bewertung konnte nicht gespeichert werden' 
            : 'Could not save review' 
        };
      }
      
      // Step 2: If we have a photo URL, create an entry in the fotos table
      if (photoUrl) {
        const fotoData = {
          benutzer_id: userId,
          gericht_id: dishId,
          restaurant_id: restaurantId,
          bewertung_id: reviewResult.id,
          foto_url: photoUrl,
          erstellt_am: new Date().toISOString(),
          aktualisiert_am: new Date().toISOString()
        };
        
        const { error: photoError } = await supabase
          .from('fotos')
          .insert(fotoData);
        
        if (photoError) {
          console.error(i18n.language === 'de' 
            ? '❌ Fehler beim Speichern des Fotos:' 
            : '❌ Error saving photo:', 
            photoError);
          
          // Don't fail entirely if only the photo association fails
          console.warn(i18n.language === 'de' 
            ? 'Bewertung wurde gespeichert, aber das Foto konnte nicht verknüpft werden' 
            : 'Review was saved, but photo could not be linked');
        }
      }
      
      console.log(i18n.language === 'de' 
        ? '✅ Bewertung erfolgreich gespeichert (Legacy-Methode)' 
        : '✅ Review saved successfully (legacy method)');
      
      return { 
        success: true,
        reviewId: reviewResult.id,
        photoUrl: photoUrl || undefined
      };
    } catch (error) {
      console.error(i18n.language === 'de' 
        ? '❌ Unerwarteter Fehler bei createReviewLegacy:' 
        : '❌ Unexpected error in createReviewLegacy:', 
        error);
      
      return { 
        success: false, 
        error: i18n.language === 'de' 
          ? 'Ein unerwarteter Fehler ist aufgetreten' 
          : 'An unexpected error occurred'
      };
    }
  }
  
  /**
   * Uploads a photo and associates it with a dish and restaurant
   * @param userId User ID
   * @param dishId Dish ID
   * @param restaurantId Restaurant ID
   * @param photoFile Photo file to upload
   * @param description Optional description of the photo
   * @returns Object with success status and optional error message
   */
  async uploadPhoto(
    userId: string,
    dishId: string,
    restaurantId: string,
    photoFile: File,
    description?: string
  ): Promise<{ success: boolean; photoUrl?: string; error?: string }> {
    try {
      console.log(i18n.language === 'de' 
        ? '📸 Foto wird hochgeladen...' 
        : '📸 Uploading photo...');
      
      // Create a unique filename
      const fileName = `photo_${userId}_${Date.now()}.${photoFile.name.split('.').pop() || 'jpg'}`;
      
      // Upload to 'fotos' bucket using StorageService
      const photoUrl = await storageService.uploadFile(photoFile, 'fotos', fileName);
      
      if (!photoUrl) {
        console.error(i18n.language === 'de' 
          ? '❌ Fehler beim Hochladen des Fotos' 
          : '❌ Error uploading photo');
        return { 
          success: false, 
          error: i18n.language === 'de' 
            ? 'Foto konnte nicht hochgeladen werden' 
            : 'Could not upload photo' 
        };
      }
      
      // Create entry in fotos table
      const fotoData = {
        benutzer_id: userId,
        gericht_id: dishId,
        restaurant_id: restaurantId,
        foto_url: photoUrl,
        beschreibung: description || null,
        erstellt_am: new Date().toISOString(),
        aktualisiert_am: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('fotos')
        .insert(fotoData);
      
      if (error) {
        console.error(i18n.language === 'de' 
          ? '❌ Fehler beim Speichern des Fotos in der Datenbank:' 
          : '❌ Error saving photo to database:', 
          error);
        return { 
          success: false, 
          error: i18n.language === 'de' 
            ? 'Foto konnte nicht gespeichert werden' 
            : 'Could not save photo' 
        };
      }
      
      console.log(i18n.language === 'de' 
        ? '✅ Foto erfolgreich hochgeladen und gespeichert' 
        : '✅ Photo uploaded and saved successfully');
      
      return { success: true, photoUrl };
    } catch (error) {
      console.error(i18n.language === 'de' 
        ? '❌ Unerwarteter Fehler bei uploadPhoto:' 
        : '❌ Unexpected error in uploadPhoto:', 
        error);
      
      return { 
        success: false, 
        error: i18n.language === 'de' 
          ? 'Ein unerwarteter Fehler ist aufgetreten' 
          : 'An unexpected error occurred'
      };
    }
  }
  
  /**
   * Gets reviews for a specific dish
   * @param dishId Dish ID
   * @param limit Maximum number of reviews to return
   * @returns Array of reviews or null if error
   */
  async getDishReviews(dishId: string, limit: number = 10) {
    try {
      // First try to get reviews with photos joined
      const { data: reviewsWithPhotos, error: joinError } = await supabase
        .from('bewertungen')
        .select(`
          id, 
          bewertung, 
          kommentar, 
          erstellt_am,
          benutzer_profil (id, benutzername, anzeigename, profilbild_url),
          fotos (id, foto_url, beschreibung)
        `)
        .eq('gericht_id', dishId)
        .order('erstellt_am', { ascending: false })
        .limit(limit);
      
      // If the join query works, use it
      if (!joinError && reviewsWithPhotos) {
        return reviewsWithPhotos;
      }
      
      // Otherwise, fall back to getting reviews and photos separately
      const { data: reviews, error: reviewsError } = await supabase
        .from('bewertungen')
        .select(`
          id, 
          bewertung, 
          kommentar, 
          erstellt_am,
          benutzer_id,
          benutzer_profil (id, benutzername, anzeigename, profilbild_url)
        `)
        .eq('gericht_id', dishId)
        .order('erstellt_am', { ascending: false })
        .limit(limit);
      
      if (reviewsError || !reviews) {
        console.error(i18n.language === 'de' 
          ? '❌ Fehler beim Laden der Bewertungen:' 
          : '❌ Error loading reviews:', 
          reviewsError);
        return null;
      }
      
      // Get photos separately and merge them
      for (const review of reviews) {
        const { data: photos } = await supabase
          .from('fotos')
          .select('id, foto_url, beschreibung')
          .eq('bewertung_id', review.id);
        
        (review as any).fotos = photos || [];
      }
      
      return reviews;
    } catch (error) {
      console.error(i18n.language === 'de' 
        ? '❌ Fehler beim Laden der Bewertungen:' 
        : '❌ Error loading reviews:', 
        error);
      return null;
    }
  }
}

// Export a single instance
export const reviewService = new ReviewService();
export default reviewService;
