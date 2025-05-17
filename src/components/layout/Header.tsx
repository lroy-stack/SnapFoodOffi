import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut, UserCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { AuthContext } from '../../context/AuthContext';
import { useConnectionStatus } from '../../services/ConnectionService';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isLoading, isAuthenticated, signOut } = useContext(AuthContext);
  const { isConnected, reconnect } = useConnectionStatus();
  
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  
  const isHomePage = location.pathname === '/';

  // Efecto para manejar la transparencia del header al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Comprobar posición inicial
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determinar la clase del header según la página y el scroll
  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled || !isHomePage
      ? 'bg-white/95 backdrop-blur-sm shadow-md text-black'
      : 'bg-transparent text-white'
  }`;

  // Navegación a la página de login
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Gestión mejorada del cierre de sesión
  const handleLogout = async () => {
    if (!isConnected) {
      try {
        // Si no hay conexión, intentar reconectar primero
        await reconnect();
      } catch (error) {
        console.error('❌ Error al reconectar para cerrar sesión:', error);
        setLogoutError(t('connection.errorDuringLogout', 'Error de conexión. Intenta de nuevo.'));
        return;
      }
    }
    
    setIsLoggingOut(true);
    setLogoutError(null);
    
    try {
      console.log('🚪 Iniciando cierre de sesión...');
      await signOut();
      console.log('✅ Sesión cerrada correctamente');
      
      // Redireccionar a la página de inicio después de un breve retraso
      // para permitir que la UI refleje el cambio
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      console.error('❌ Error durante el cierre de sesión:', error);
      setLogoutError(t('auth.logoutError', 'Error al cerrar sesión. Intenta de nuevo.'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Renderizado del Header
  return (
    <header className={headerClass}>
      {/* Mensaje de error durante el cierre de sesión */}
      <AnimatePresence>
        {logoutError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 bg-red-100 border-b border-red-200 text-red-800 px-4 py-2 text-sm text-center"
          >
            {logoutError}
            <button 
              onClick={() => setLogoutError(null)}
              className="ml-2 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight">{t('app.name')}</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Search size={20} />
          </button>
          
          <LanguageSwitcher />
          
          {/* Estado de autenticación */}
          {isLoading ? (
            // Indicador de carga
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            </div>
          ) : isAuthenticated && user ? (
            // Usuario autenticado
            <div className="relative group">
              <Link to="/profile">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-medium overflow-hidden">
                  {profile?.profilbild_url ? (
                    <img 
                      src={profile.profilbild_url} 
                      alt={profile.benutzername} 
                      className="w-full h-full object-cover"
                    />
                  ) : profile?.anzeigename ? (
                    profile.anzeigename.charAt(0).toUpperCase()
                  ) : profile?.benutzername ? (
                    profile.benutzername.charAt(0).toUpperCase()
                  ) : (
                    <UserCircle size={20} />
                  )}
                </div>
              </Link>
              
              {/* Menú desplegable */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  {/* Información del usuario */}
                  {profile && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-800">
                        {profile.anzeigename || profile.benutzername}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                  
                  {/* Opciones del menú */}
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    {t('profile.title')}
                  </Link>
                  
                  {/* Botón de cierre de sesión */}
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    {isLoggingOut ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        {t('auth.loggingOut', 'Cerrando sesión...')}
                      </>
                    ) : (
                      <>
                        <LogOut size={16} className="mr-2" />
                        {t('auth.logout')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Usuario no autenticado
            <button 
              onClick={handleLoginClick}
              className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-full transition-colors duration-200 shadow-sm hover:shadow"
            >
              {t('auth.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
