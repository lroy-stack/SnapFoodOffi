import { supabase } from './supabaseClient';
import profileFallbackService, { UserProfile } from './ProfileFallbackService';
import authService from './AuthService';
import i18n from '../utils/i18n';

/**
 * Specialized service for user profile operations
 * which properly handles permissions and transactions.
 * 
 * Spezialisierter Dienst für Benutzerprofiloperationen
 * der Berechtigungen und Transaktionen angemessen verwaltet.
 */
class ProfileService {
  /**
   * Gets the profile of the current user or a specific ID
   * @param userId User ID (optional, uses current user if not specified)
   * @returns The user profile or null if it doesn't exist
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      // If no ID is provided, use the current user
      if (!userId) {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) return null;
        userId = currentUser.id;
      }
      
      console.log(`🔍 ${i18n.language === 'de' ? 'Suche Profil für Benutzer' : 'Looking for profile for user'}: ${userId}`);
      
      // Try to get the profile from the database
      const { data, error } = await supabase
        .from('benutzer_profil')
        .select('*')
        .eq('auth_id', userId)
        .single();
      
      if (error) {
        console.error(i18n.language === 'de' ? 'Fehler beim Abrufen des Profils' : 'Error retrieving profile:', error);
        
        // If the profile doesn't exist, try to create a fallback
        if (error.code === 'PGRST116') { // No single record found
          console.log(i18n.language === 'de' ? 'Kein Profil gefunden, generiere Fallback' : 'No profile found, generating fallback');
          return this.generateFallbackProfile(userId);
        }
        
        return null;
      }
      
      console.log(`✅ ${i18n.language === 'de' ? 'Profil erfolgreich geladen' : 'Profile successfully loaded'}: ${data.benutzername}`);
      return data as UserProfile;
    } catch (error) {
      console.error(i18n.language === 'de' ? 'Fehler in getUserProfile' : 'Error in getUserProfile:', error);
      return null;
    }
  }
  
  /**
   * Generates a fallback profile for a user
   * @param userId User ID
   * @returns Generated profile or null if it couldn't be generated
   */
  private async generateFallbackProfile(userId: string): Promise<UserProfile | null> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return null;
      
      const fallbackProfile = profileFallbackService.generateFallbackProfile(currentUser);
      return fallbackProfile;
    } catch (error) {
      console.error(i18n.language === 'de' ? 'Fehler beim Generieren des Fallback-Profils' : 'Error generating fallback profile:', error);
      return null;
    }
  }
  
  /**
   * Updates the user profile. Properly handles permissions and transactions.
   * @param profile Profile data to update
   * @returns true if the update was successful, false if it failed
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      // Verify we have a valid ID
      if (!profile.auth_id) {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          console.error(i18n.language === 'de' ? 'Kein authentifizierter Benutzer zum Aktualisieren des Profils' : 'No authenticated user to update profile');
          return false;
        }
        profile.auth_id = currentUser.id;
      }
      
      // Disable automatic error handling to control more precisely
      const { error } = await supabase
        .from('benutzer_profil')
        .update({
          ...profile,
          aktualisiert_am: new Date().toISOString()
        })
        .eq('auth_id', profile.auth_id)
        .select()
        .single();
      
      if (error) {
        console.error(i18n.language === 'de' ? 'Fehler beim Aktualisieren des Profils' : 'Error updating profile:', error);
        
        // Specific errors we can handle
        if (error.message && error.message.includes('permission denied')) {
          console.log(i18n.language === 'de' ? 'Berechtigungsfehler, versuche alternative Methode...' : 'Permission error, trying alternative method...');
          return await this.updateProfileAlternative(profile);
        }
        
        return false;
      }
      
      console.log(`✅ ${i18n.language === 'de' ? 'Profil erfolgreich aktualisiert' : 'Profile successfully updated'}`);
      return true;
    } catch (error) {
      console.error(i18n.language === 'de' ? 'Allgemeiner Fehler in updateProfile' : 'General error in updateProfile:', error);
      return false;
    }
  }
  
  /**
   * Alternative method to update the profile when there are permission issues
   * @param profile Profile data to update
   * @returns true if the update was successful, false if it failed
   */
  private async updateProfileAlternative(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      // First get the current profile to have the internal ID
      const currentProfile = await this.getUserProfile(profile.auth_id);
      if (!currentProfile || !currentProfile.id) {
        console.error(i18n.language === 'de' ? 'Konnte aktuelles Profil nicht für Update abrufen' : 'Could not get current profile for update');
        return false;
      }
      
      // Update by internal ID instead of auth_id
      const { error } = await supabase
        .from('benutzer_profil')
        .update({
          benutzername: profile.benutzername || currentProfile.benutzername,
          anzeigename: profile.anzeigename !== undefined ? profile.anzeigename : currentProfile.anzeigename,
          profilbild_url: profile.profilbild_url !== undefined ? profile.profilbild_url : currentProfile.profilbild_url,
          sprache: profile.sprache || currentProfile.sprache,
          aktualisiert_am: new Date().toISOString()
        })
        .eq('id', currentProfile.id);
      
      if (error) {
        console.error(i18n.language === 'de' ? 'Fehler in alternativer Methode' : 'Error in alternative method:', error);
        return false;
      }
      
      console.log(`✅ ${i18n.language === 'de' ? 'Profil erfolgreich über alternative Methode aktualisiert' : 'Profile successfully updated via alternative method'}`);
      return true;
    } catch (error) {
      console.error(i18n.language === 'de' ? 'Allgemeiner Fehler in updateProfileAlternative' : 'General error in updateProfileAlternative:', error);
      return false;
    }
  }
  
  /**
   * Creates a new user profile for a newly registered user
   * @param userId Authentication ID of the user
   * @param username Username
   * @param displayName Display name (optional)
   * @param language Preferred language (optional)
   * @returns The created profile or null if it failed
   */
  async createProfile(
    userId: string, 
    username: string, 
    displayName?: string | null, 
    language?: 'de' | 'en'
  ): Promise<UserProfile | null> {
    try {
      const newProfile = {
        auth_id: userId,
        benutzername: username,
        anzeigename: displayName || username,
        profilbild_url: null,
        sprache: language || 'de',
        rolle: 'benutzer',
        erstellt_am: new Date().toISOString(),
        aktualisiert_am: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('benutzer_profil')
        .insert(newProfile)
        .select()
        .single();
      
      if (error) {
        console.error(i18n.language === 'de' ? 'Fehler beim Erstellen des Profils' : 'Error creating profile:', error);
        return null;
      }
      
      console.log(`✅ ${i18n.language === 'de' ? 'Profil erfolgreich erstellt' : 'Profile successfully created'}: ${data.benutzername}`);
      return data as UserProfile;
    } catch (error) {
      console.error(i18n.language === 'de' ? 'Fehler in createProfile' : 'Error in createProfile:', error);
      return null;
    }
  }
  
  /**
   * Checks if a username is available
   * @param username Username to check
   * @param excludeUserId User ID to exclude from the check (for updates)
   * @returns true if it's available, false if it's already in use
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('benutzer_profil')
        .select('benutzername')
        .eq('benutzername', username);
      
      // If we're updating an existing user, exclude them from the search
      if (excludeUserId) {
        query = query.neq('auth_id', excludeUserId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(i18n.language === 'de' ? 'Fehler beim Überprüfen der Benutzernamen-Verfügbarkeit' : 'Error checking username availability:', error);
        return false;
      }
      
      // If there are no results, the username is available
      return (data?.length || 0) === 0;
    } catch (error) {
      console.error(i18n.language === 'de' ? 'Fehler in isUsernameAvailable' : 'Error in isUsernameAvailable:', error);
      return false;
    }
  }
}

// Export a single instance
export const profileService = new ProfileService();
export default profileService;
