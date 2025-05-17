import { supabaseService } from './supabaseService';
import { useState, useEffect } from 'react';

// Estados de conexión
export enum ConnectionStatus {
  INITIALIZING = 'initializing',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Razones para el estado de la conexión
export enum ConnectionReason {
  INITIAL = 'initial', // Estado inicial
  NETWORK = 'network', // Problema de red
  AUTH = 'auth',       // Problema de autenticación
  DB = 'db',           // Problema de base de datos
  TIMEOUT = 'timeout', // Tiempo de espera agotado
  UNKNOWN = 'unknown'  // Causa desconocida
}

let connectionRetryAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 segundos

/**
 * Clase para gestionar la conexión a Supabase y monitorizar su estado
 */
class ConnectionManager {
  private status: ConnectionStatus = ConnectionStatus.INITIALIZING;
  private reason: ConnectionReason = ConnectionReason.INITIAL;
  private listeners: Array<(status: ConnectionStatus, reason: ConnectionReason) => void> = [];
  private reconnectTimer: number | null = null;
  private isReconnecting = false;

  constructor() {
    // Inicializar la conexión inmediatamente
    this.initializeConnection();
    
    // Configurar listener para eventos de red
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Inicializa la conexión a Supabase
   */
  async initializeConnection() {
    this.updateStatus(ConnectionStatus.INITIALIZING, ConnectionReason.INITIAL);
    
    try {
      const isConnected = await supabaseService.testConnection();
      
      if (isConnected) {
        console.log('✅ Conexión a Supabase establecida correctamente');
        this.updateStatus(ConnectionStatus.CONNECTED, ConnectionReason.INITIAL);
        connectionRetryAttempts = 0; // Resetear contador de intentos
      } else {
        console.error('❌ No se pudo establecer conexión a Supabase');
        this.updateStatus(ConnectionStatus.ERROR, ConnectionReason.DB);
        this.scheduleReconnect();
      }
    } catch (error) {
      console.error('❌ Error al inicializar la conexión:', error);
      
      // Determinar la razón del error
      let reason = ConnectionReason.UNKNOWN;
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          reason = ConnectionReason.NETWORK;
        } else if (error.message.includes('auth') || error.message.includes('token')) {
          reason = ConnectionReason.AUTH;
        } else if (error.message.includes('timeout')) {
          reason = ConnectionReason.TIMEOUT;
        }
      }
      
      this.updateStatus(ConnectionStatus.ERROR, reason);
      this.scheduleReconnect();
    }
  }

  /**
   * Programa un intento de reconexión
   */
  private scheduleReconnect() {
    if (this.isReconnecting || connectionRetryAttempts >= MAX_RETRY_ATTEMPTS) {
      if (connectionRetryAttempts >= MAX_RETRY_ATTEMPTS) {
        console.error(`⚠️ Se alcanzó el máximo de intentos de reconexión (${MAX_RETRY_ATTEMPTS})`);
      }
      return;
    }
    
    this.isReconnecting = true;
    connectionRetryAttempts++;
    
    console.log(`🔄 Programando reconexión (intento ${connectionRetryAttempts}/${MAX_RETRY_ATTEMPTS}) en ${RETRY_DELAY_MS}ms`);
    
    // Limpiar cualquier temporizador existente
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.updateStatus(ConnectionStatus.RECONNECTING, ConnectionReason.NETWORK);
    
    // Establecer nuevo temporizador
    this.reconnectTimer = window.setTimeout(() => {
      this.isReconnecting = false;
      this.reconnect();
    }, RETRY_DELAY_MS);
  }

  /**
   * Intenta la reconexión a Supabase
   */
  async reconnect() {
    console.log('🔄 Intentando reconexión a Supabase...');
    
    try {
      // Forzar actualización de la sesión si hay un usuario autenticado
      const { data } = await supabaseService.getSession();
      const session = data?.session;
      
      if (session) {
        console.log('🔑 Sesión detectada, verificando token');
        
        // Si hay un token, verificar su validez renovándolo
        await supabaseService.supabase.auth.refreshSession();
      }
      
      // Probar la conexión
      const isConnected = await supabaseService.testConnection();
      
      if (isConnected) {
        console.log('✅ Reconexión exitosa');
        this.updateStatus(ConnectionStatus.CONNECTED, ConnectionReason.INITIAL);
        connectionRetryAttempts = 0; // Resetear contador
      } else {
        console.error('❌ Reconexión fallida');
        this.updateStatus(ConnectionStatus.DISCONNECTED, ConnectionReason.DB);
        this.scheduleReconnect();
      }
    } catch (error) {
      console.error('❌ Error durante la reconexión:', error);
      this.updateStatus(ConnectionStatus.ERROR, ConnectionReason.UNKNOWN);
      this.scheduleReconnect();
    }
  }

  /**
   * Maneja el evento de conexión a Internet
   */
  private handleOnline = () => {
    console.log('🌐 Conexión a Internet detectada');
    this.reconnect();
  };

  /**
   * Maneja el evento de desconexión de Internet
   */
  private handleOffline = () => {
    console.log('🌐 Desconexión de Internet detectada');
    this.updateStatus(ConnectionStatus.DISCONNECTED, ConnectionReason.NETWORK);
  };

  /**
   * Actualiza el estado de la conexión y notifica a los oyentes
   */
  private updateStatus(status: ConnectionStatus, reason: ConnectionReason) {
    this.status = status;
    this.reason = reason;
    
    // Notificar a todos los oyentes
    this.listeners.forEach(listener => {
      try {
        listener(status, reason);
      } catch (error) {
        console.error('Error en listener de estado de conexión:', error);
      }
    });
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getStatus(): { status: ConnectionStatus; reason: ConnectionReason } {
    return { status: this.status, reason: this.reason };
  }

  /**
   * Añade un oyente para los cambios de estado de conexión
   */
  addListener(listener: (status: ConnectionStatus, reason: ConnectionReason) => void): () => void {
    this.listeners.push(listener);
    
    // Emitir estado actual inmediatamente
    try {
      listener(this.status, this.reason);
    } catch (error) {
      console.error('Error en listener al emitir estado inicial:', error);
    }
    
    // Devolver función para eliminar el oyente
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Elimina un oyente de cambios de estado
   */
  removeListener(listener: (status: ConnectionStatus, reason: ConnectionReason) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Fuerza una comprobación de conexión
   */
  async checkConnection(): Promise<boolean> {
    try {
      const isConnected = await supabaseService.testConnection();
      
      if (!isConnected) {
        this.updateStatus(ConnectionStatus.DISCONNECTED, ConnectionReason.DB);
        this.scheduleReconnect();
      } else if (this.status !== ConnectionStatus.CONNECTED) {
        // Si la conexión fue exitosa pero el estado no era CONNECTED, actualizarlo
        this.updateStatus(ConnectionStatus.CONNECTED, ConnectionReason.INITIAL);
      }
      
      return isConnected;
    } catch (error) {
      console.error('Error al comprobar conexión:', error);
      this.updateStatus(ConnectionStatus.ERROR, ConnectionReason.UNKNOWN);
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Libera recursos al desmontar
   */
  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.listeners = [];
  }
}

// Crear y exportar una única instancia
export const connectionManager = new ConnectionManager();

/**
 * Hook para usar el estado de conexión en componentes
 */
export function useConnectionStatus() {
  const [connectionState, setConnectionState] = useState<{
    status: ConnectionStatus;
    reason: ConnectionReason;
  }>({ 
    status: ConnectionStatus.INITIALIZING, 
    reason: ConnectionReason.INITIAL 
  });

  useEffect(() => {
    // Obtener estado inicial
    setConnectionState(connectionManager.getStatus());
    
    // Suscribirse a cambios
    const unsubscribe = connectionManager.addListener((status, reason) => {
      setConnectionState({ status, reason });
    });
    
    // Limpiar al desmontar
    return unsubscribe;
  }, []);

  // Función para forzar comprobación de conexión
  const checkConnection = async () => {
    return await connectionManager.checkConnection();
  };

  // Función para forzar reconexión
  const reconnect = async () => {
    return connectionManager.reconnect();
  };

  return {
    ...connectionState,
    isConnected: connectionState.status === ConnectionStatus.CONNECTED,
    isDisconnected: connectionState.status === ConnectionStatus.DISCONNECTED || 
                    connectionState.status === ConnectionStatus.ERROR,
    isInitializing: connectionState.status === ConnectionStatus.INITIALIZING,
    isReconnecting: connectionState.status === ConnectionStatus.RECONNECTING,
    checkConnection,
    reconnect
  };
}

export default connectionManager;
