import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import supabaseService from '../services/supabaseService';
import authService from '../services/AuthService';
import profileFallbackService, { UserProfile } from '../services/ProfileFallbackService';
import profileService from '../services/ProfileService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  profileError: string | null;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isModerator: false,
  profileError: null,
  signUp: async () => ({ user: null, error: null }),
  signIn: async () => ({ user: null, error: null }),
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  refreshProfile: async () => {},
  refreshSession: async () => false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Función mejorada para cargar perfil de usuario con respaldo
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    try {
      console.log(`🔍 Cargando perfil para usuario ${userId}...`);
      setProfileError(null);
      
      // Usar ProfileService primero para obtener el perfil
      const userProfile = await profileService.getUserProfile(userId);
      
      if (userProfile) {
        console.log('✅ Perfil cargado correctamente desde ProfileService');
        return userProfile;
      }
      
      // Fallback al método anterior si el ProfileService falla
      const supabaseProfile = await supabaseService.getUserProfile(userId);
      
      if (supabaseProfile) {
        console.log('✅ Perfil cargado correctamente desde la base de datos');
        return supabaseProfile;
      } 
      
      // Si no se encontró el perfil en Supabase, generar uno de respaldo
      console.log('⚠️ Perfil no encontrado en la base de datos, usando respaldo');
      
      // Obtener usuario actual para generar perfil de respaldo
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ No se pudo obtener usuario para generar perfil de respaldo');
        setProfileError('No se encontró información de tu usuario');
        return null;
      }
      
      // Generar perfil de respaldo basado en el usuario autenticado
      const fallbackProfile = profileFallbackService.generateFallbackProfile(currentUser);
      
      if (fallbackProfile) {
        console.log('✅ Perfil de respaldo generado correctamente');
        // Establecer un mensaje de advertencia pero sin bloquear la experiencia
        setProfileError('Tu perfil se muestra en modo provisional. Algunos datos pueden no estar disponibles.');
        
        // Intentar crear un perfil real para futuras visitas
        try {
          // Crear un nombre de usuario basado en el correo
          const randomUsername = currentUser.email?.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
          
          await profileService.createProfile(
            currentUser.id,
            randomUsername || `user_${Math.floor(Math.random() * 10000)}`,
            null,
            fallbackProfile.sprache as 'de' | 'en'
          );
          
          console.log('✅ Perfil creado automáticamente para el usuario');
          setProfileError(null);
        } catch (createError) {
          console.error('❌ Error al crear perfil automático:', createError);
        }
        
        return fallbackProfile;
      } else {
        console.log('❌ Error al generar perfil de respaldo');
        setProfileError('No se pudo crear un perfil provisional');
        return null;
      }
    } catch (error) {
      console.error(`❌ Error al cargar perfil:`, error);
      
      try {
        // Último intento: generar perfil de respaldo en caso de error
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          console.log('🔄 Generando perfil de respaldo después de error');
          const fallbackProfile = profileFallbackService.generateFallbackProfile(currentUser);
          setProfileError('Perfil en modo limitado debido a un error de conexión');
          return fallbackProfile;
        }
      } catch (fallbackError) {
        console.error('❌ Error en la generación de respaldo:', fallbackError);
      }
      
      setProfileError('Error inesperado al cargar tu perfil');
      return null;
    }
  };

  // Sincronizar con el nuevo AuthService
  useEffect(() => {
    setIsLoading(true);
    
    // Estado inicial
    const initAuth = async () => {
      try {
        // Primero intentar refrescar la sesión
        await authService.checkAndRefreshSession();
        
        // Obtener usuario actual
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          console.log('✅ Usuario autenticado:', currentUser.email);
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Cargar perfil
          const userProfile = await loadUserProfile(currentUser.id);
          
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(userProfile.rolle === 'admin');
            setIsModerator(['admin', 'moderator'].includes(userProfile.rolle));
          }
        } else {
          resetAuthState();
        }
      } catch (error) {
        console.error('❌ Error en inicialización de autenticación:', error);
        resetAuthState();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Suscribirse a cambios de autenticación
    const unsubscribeFromAuth = authService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        console.log('🔄 Evento de autenticación: usuario autenticado');
        setUser(authUser);
        setIsAuthenticated(true);
        setIsLoading(true);
        
        try {
          // Cargar perfil de usuario
          const userProfile = await loadUserProfile(authUser.id);
          
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(userProfile.rolle === 'admin');
            setIsModerator(['admin', 'moderator'].includes(userProfile.rolle));
          }
        } catch (error) {
          console.error('❌ Error al cargar perfil tras cambio de autenticación:', error);
          setProfileError('Error al acceder a tu perfil');
          setProfile(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('🔄 Evento de autenticación: sin sesión');
        resetAuthState();
      }
    });
    
    // Suscribirse a eventos de cierre de sesión
    const unsubscribeFromSignOut = authService.onSignOut(() => {
      console.log('🚪 Cierre de sesión detectado');
      resetAuthState();
    });
    
    // Ejecutar inicialización
    initAuth();
    
    // Limpieza de suscripciones
    return () => {
      unsubscribeFromAuth();
      unsubscribeFromSignOut();
    };
  }, []);

  // Restablecer estado a valores iniciales
  const resetAuthState = () => {
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsModerator(false);
    setProfileError(null);
    setIsLoading(false);
  };

  // Refrescar perfil manualmente
  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    setProfileError(null);
    
    try {
      const userProfile = await loadUserProfile(user.id);
      
      if (userProfile) {
        setProfile(userProfile);
        setIsAdmin(userProfile.rolle === 'admin');
        setIsModerator(['admin', 'moderator'].includes(userProfile.rolle));
      }
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      setProfileError('Error al actualizar datos del perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar sesión
  const refreshSession = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.checkAndRefreshSession();
      if (result && user) {
        // Si tenemos usuario pero sin perfil, intentar cargarlo
        if (user && !profile) {
          await refreshProfile();
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Error al refrescar sesión:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Usar AuthService para operaciones de autenticación
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      return await authService.signUp(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setProfileError(null);
    
    try {
      const response = await authService.signIn(email, password);
      return response;
    } catch (error) {
      console.error('❌ Error en inicio de sesión:', error);
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Métodos delegados a Supabase
  const signInWithGoogle = async () => {
    await supabaseService.signInWithGoogle();
  };

  const signInWithApple = async () => {
    await supabaseService.signInWithApple();
  };

  const signInWithMagicLink = async (email: string) => {
    return await supabaseService.signInWithMagicLink(email);
  };

  // Cierre de sesión mejorado
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await authService.signOut();
    } catch (error) {
      console.error('❌ Error en cierre de sesión:', error);
    } finally {
      resetAuthState();
    }
  };

  const resetPassword = async (email: string) => {
    return await supabaseService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return await supabaseService.updatePassword(newPassword);
  };

  const contextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isModerator,
    profileError,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
