import { User } from '@supabase/supabase-js';

/**
 * Tipos de perfil utilizados en la aplicación
 */
export interface UserProfile {
  id: string;
  auth_id: string;
  benutzername: string;
  anzeigename: string | null;
  profilbild_url: string | null;
  sprache: string;
  rolle: 'benutzer' | 'moderator' | 'admin';
  erstellt_am: string;
  aktualisiert_am: string;
}

/**
 * Servicio para proporcionar datos de perfil de respaldo cuando
 * la base de datos no tiene información del usuario o cuando hay
 * problemas de conexión.
 */
class ProfileFallbackService {
  // Cache para reducir llamadas redundantes
  private profileCache = new Map<string, UserProfile>();
  
  /**
   * Genera un perfil de respaldo para un usuario autenticado
   */
  generateFallbackProfile(user: User): UserProfile {
    // Verificar si ya tenemos un perfil en caché para este usuario
    if (this.profileCache.has(user.id)) {
      return this.profileCache.get(user.id)!;
    }
    
    console.log('📝 Generando perfil de respaldo para:', user.email);
    
    // Extraer nombre de usuario del email
    const emailParts = user.email?.split('@') || ['usuario'];
    const username = emailParts[0].replace(/[^a-zA-Z0-9]/g, '');
    
    // Crear perfil de respaldo
    const fallbackProfile: UserProfile = {
      id: `local-${user.id}`,
      auth_id: user.id,
      benutzername: username,
      anzeigename: this.formatDisplayName(username),
      profilbild_url: null,
      sprache: 'es',
      rolle: 'benutzer',
      erstellt_am: user.created_at || new Date().toISOString(),
      aktualisiert_am: new Date().toISOString()
    };
    
    // Guardar en caché
    this.profileCache.set(user.id, fallbackProfile);
    
    return fallbackProfile;
  }
  
  /**
   * Formatea un nombre de usuario para mostrar
   */
  private formatDisplayName(username: string): string {
    // Convertir primera letra a mayúscula y el resto a minúscula
    if (username.length > 0) {
      return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    }
    return username;
  }
  
  /**
   * Determina si un perfil es de respaldo (no está en la base de datos)
   */
  isFallbackProfile(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return profile.id.startsWith('local-');
  }
}

// Exportar una única instancia
export const profileFallbackService = new ProfileFallbackService();
export default profileFallbackService;
