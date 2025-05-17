import { User } from '@supabase/supabase-js';
import supabaseService from './supabaseService';

/**
 * Servicio centralizado para gestionar todas las operaciones de autenticación
 * y sincronizar los diferentes contextos (AuthContext y UserContext)
 */
class AuthService {
  // Cache para reducir llamadas repetidas
  private authUserCache: User | null = null;
  private isInitialized = false;
  
  // Callbacks para sincronizar diferentes partes de la aplicación
  private authCallbacks: Array<(user: User | null) => void> = [];
  private logoutCallbacks: Array<() => void> = [];
  
  constructor() {
    // Inicializar servicio al crear la instancia
    this.initialize();
  }
  
  /**
   * Inicializa el servicio y configura los listeners de Supabase
   */
  async initialize() {
    if (this.isInitialized) return;
    
    // Verificar si hay una sesión existente
    try {
      console.log('🔑 Inicializando AuthService...');
      
      // Obtener sesión actual
      const { data } = await supabaseService.getSession();
      const session = data?.session;
      
      if (session?.user) {
        this.authUserCache = session.user;
        console.log('✅ Usuario autenticado encontrado:', session.user.email);
      } else {
        console.log('ℹ️ No hay sesión activa');
        this.authUserCache = null;
      }
      
      // Configurar listener para cambios de autenticación
      const { data: authListener } = supabaseService.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Evento de autenticación:', event);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              console.log('✅ Usuario autenticado:', session.user.email);
              this.authUserCache = session.user;
              this.notifyAuthChange(session.user);
            }
          } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            console.log('ℹ️ Sesión cerrada');
            this.authUserCache = null;
            this.notifyAuthChange(null);
            this.notifyLogout();
          }
        }
      );
      
      this.isInitialized = true;
      console.log('✅ AuthService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar AuthService:', error);
      this.authUserCache = null;
    }
  }
  
  /**
   * Obtiene el usuario autenticado actual
   */
  async getCurrentUser(): Promise<User | null> {
    // Si ya tenemos el usuario en caché, devolverlo
    if (this.authUserCache) {
      return this.authUserCache;
    }
    
    // Intentar obtener el usuario de Supabase
    try {
      console.log('🔍 Obteniendo usuario actual de Supabase...');
      const { data: { user } } = await supabaseService.supabase.auth.getUser();
      
      this.authUserCache = user;
      return user;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      return null;
    }
  }
  
  /**
   * Inicia sesión con email y contraseña
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      console.log('🔑 Intentando inicio de sesión:', email);
      
      // Primero intentamos limpiar cualquier sesión existente
      await this.forceClearSession();
      
      // Intento de inicio de sesión
      const result = await supabaseService.signIn(email, password);
      
      if (result.user) {
        console.log('✅ Inicio de sesión exitoso');
        this.authUserCache = result.user;
        this.notifyAuthChange(result.user);
      } else if (result.error) {
        console.error('❌ Error en inicio de sesión:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error inesperado en inicio de sesión:', error);
      return { user: null, error };
    }
  }
  
  /**
   * Registro con email y contraseña
   */
  async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      console.log('📝 Registrando nuevo usuario:', email);
      const result = await supabaseService.signUp(email, password);
      
      if (result.user) {
        console.log('✅ Registro exitoso, confirmación de email enviada');
      } else if (result.error) {
        console.error('❌ Error en registro:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error inesperado en registro:', error);
      return { user: null, error };
    }
  }
  
  /**
   * Cierre de sesión robusto con múltiples estrategias de recuperación
   */
  async signOut(): Promise<boolean> {
    console.log('🚪 Iniciando proceso de cierre de sesión...');
    
    try {
      // Notificar antes del intento de cierre
      this.notifyLogout();
      
      // 1. Intento normal usando el cliente de Supabase
      try {
        const { error } = await supabaseService.signOut();
        if (!error) {
          console.log('✅ Cierre de sesión normal exitoso');
          this.authUserCache = null;
          this.notifyAuthChange(null);
          return true;
        } else {
          console.warn('⚠️ Error en cierre de sesión normal:', error);
        }
      } catch (e) {
        console.warn('⚠️ Error en método de cierre normal:', e);
      }
      
      // 2. Si el cierre normal falla, intentamos borrar el token directamente
      await this.forceClearSession();
      
      console.log('✅ Sesión cerrada correctamente');
      this.authUserCache = null;
      this.notifyAuthChange(null);
      return true;
    } catch (error) {
      console.error('❌ Error fatal en cierre de sesión:', error);
      // Aún así, intentamos limpiar todo
      await this.forceClearSession();
      this.authUserCache = null;
      this.notifyAuthChange(null);
      return false;
    }
  }
  
  /**
   * Fuerza el borrado de la sesión directamente del storage
   */
  private async forceClearSession(): Promise<void> {
    try {
      console.log('🧹 Limpiando sesión forzadamente...');
      
      // 1. Borrar token específico de Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const tokenKey = 'sb-' + supabaseUrl.split('//')[1] + '-auth-token';
      localStorage.removeItem(tokenKey);
      
      // 2. Eliminar cookie si existe
      document.cookie = 'sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 3. Resetear instancia en memoria
      await supabaseService.supabase.auth.signOut({
        scope: 'local'
      });
      
      console.log('✅ Limpieza forzada completada');
    } catch (e) {
      console.warn('⚠️ Error en limpieza forzada:', e);
    }
  }
  
  /**
   * Registra un callback para cambios de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authCallbacks.push(callback);
    
    // Devolver función para desuscribirse
    return () => {
      this.authCallbacks = this.authCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Registra un callback para eventos de cierre de sesión
   */
  onSignOut(callback: () => void): () => void {
    this.logoutCallbacks.push(callback);
    
    // Devolver función para desuscribirse
    return () => {
      this.logoutCallbacks = this.logoutCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notifica a todos los listeners sobre cambios de autenticación
   */
  private notifyAuthChange(user: User | null): void {
    this.authCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (e) {
        console.error('Error en callback de autenticación:', e);
      }
    });
  }
  
  /**
   * Notifica a todos los listeners sobre cierre de sesión
   */
  private notifyLogout(): void {
    this.logoutCallbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Error en callback de cierre de sesión:', e);
      }
    });
  }
  
  /**
   * Verifica si hay sesión activa e intenta refrescarla
   */
  async checkAndRefreshSession(): Promise<boolean> {
    try {
      console.log('🔄 Verificando y refrescando sesión...');
      
      // Intentar obtener sesión actual
      const { data } = await supabaseService.getSession();
      const session = data?.session;
      
      if (!session) {
        console.log('ℹ️ No hay sesión activa para refrescar');
        this.authUserCache = null;
        return false;
      }
      
      // Intentar refrescar la sesión
      try {
        const { data: refreshData } = await supabaseService.supabase.auth.refreshSession();
        const refreshedSession = refreshData?.session;
        
        if (refreshedSession?.user) {
          console.log('✅ Sesión refrescada correctamente');
          this.authUserCache = refreshedSession.user;
          this.notifyAuthChange(refreshedSession.user);
          return true;
        } else {
          console.warn('⚠️ Sesión no pudo ser refrescada');
          return false;
        }
      } catch (error) {
        console.error('❌ Error al refrescar sesión:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      return false;
    }
  }
}

// Crear y exportar una única instancia
export const authService = new AuthService();

export default authService;
