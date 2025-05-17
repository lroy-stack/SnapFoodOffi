import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Star, LogOut, RefreshCw, AlertOctagon, Edit, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { GamificationContext } from '../contexts/GamificationContext';
import LevelProgress from '../components/gamification/LevelProgress';
import UserStatsOverview from '../components/gamification/UserStatsOverview';
import BadgeCategoryTabs from '../components/gamification/BadgeCategoryTabs';
import AlertBanner from '../components/common/AlertBanner';
import ProfileEditor from '../components/user/ProfileEditor';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, isLoading, signOut, profileError, refreshProfile } = useContext(AuthContext);
  const { userStats } = useContext(GamificationContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('stats');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    // Show error banner if there's a profile error
    if (profileError) {
      setShowErrorBanner(true);
    }
  }, [user, isLoading, navigate, profileError]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setIsRefreshing(false);
  };
  
  // Handle logout with direct approach
  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      // Direct logout through Supabase
      await signOut();
      
      // Force redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Attempt a force logout by clearing storage
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  // Handle emergency logout (for when other methods fail)
  const handleEmergencyLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // Show alternative loading state when signing out
  if (isSigningOut) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-24 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-600">
          {t('auth.logout')}...
        </p>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-24 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  // Error state when user is authenticated but profile couldn't be loaded
  if (user && !profile) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-24">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg mx-auto text-center">
          <AlertOctagon size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error de perfil</h2>
          <p className="text-gray-600 mb-6">
            {profileError || 'No se pudo cargar tu perfil. Por favor, intenta nuevamente o cierra sesión.'}
          </p>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {isRefreshing ? (
                <RefreshCw size={20} className="animate-spin mr-2" />
              ) : (
                <RefreshCw size={20} className="mr-2" />
              )}
              Reintentar
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Cerrar sesión
            </button>
            
            <button 
              onClick={handleEmergencyLogout}
              className="text-gray-500 text-sm hover:underline"
            >
              Cerrar sesión de emergencia
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, the useEffect will redirect
  if (!user || !profile) return null;

  return (
    <div className="container mx-auto px-4 pt-20 pb-24">
      {/* Error banner for non-critical errors */}
      {showErrorBanner && profileError && (
        <AlertBanner 
          message={profileError} 
          type="error" 
          onClose={() => setShowErrorBanner(false)} 
          className="mb-6"
        />
      )}
      
      {/* Mostrar editor de perfil si está activo */}
      {showProfileEditor ? (
        <div className="mb-6">
          <ProfileEditor 
            onClose={() => setShowProfileEditor(false)}
            onUpdate={(updatedProfile) => {
              setShowProfileEditor(false);
              // El perfil se actualiza a través del AuthContext
            }}
          />
        </div>
      ) : (
        <>
          {/* Cabecera de perfil */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="mr-4">
                {profile?.profilbild_url ? (
                  <img 
                    src={profile.profilbild_url} 
                    alt={profile.anzeigename || profile.benutzername}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-2 border-white shadow-md">
                    <UserIcon size={32} />
                  </div>
                )}
              </div>
              
              {/* Información del usuario */}
              <div className="flex-1">
                <h1 className="text-xl font-bold">
                  {profile.anzeigename || profile.benutzername || t('profile.unnamed')}
                </h1>
                <p className="text-gray-500 text-sm">@{profile.benutzername}</p>
                <div className="mt-1 text-sm text-gray-600">
                  {t('profile.memberSince')}: {new Date(profile.erstellt_am).toLocaleDateString()}
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Edit size={16} className="mr-1" />
                  {t('profile.edit')}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 font-medium px-3 py-1.5 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {!showProfileEditor && <LevelProgress />}
      
      {/* Tabs para Stats & Badges - solo mostrar si no está editando el perfil */}
      {!showProfileEditor && (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 font-medium text-center ${
              selectedTab === 'stats' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('stats')}
          >
            {t('profile.stats')}
          </button>
          <button
            className={`flex-1 py-3 px-4 font-medium text-center ${
              selectedTab === 'badges' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('badges')}
          >
            {t('profile.badges')}
          </button>
        </div>
        
        <div className="p-4">
          {selectedTab === 'stats' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="stats"
            >
              <UserStatsOverview />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="badges"
            >
              <BadgeCategoryTabs />
            </motion.div>
          )}
        </div>
        </div>
      )}
      
      {/* Sección de contribuciones del usuario - solo mostrar si no está editando el perfil */}
      {!showProfileEditor && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('profile.contributions')}</h2>
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              <Camera size={16} />
              <span>{t('upload.addPhoto')}</span>
            </button>
          </div>
        
          {userStats && userStats.photosCount > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {/* This would be real content in production */}
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded-md overflow-hidden relative">
                <img 
                  src={`https://via.placeholder.com/150?text=Food${i}`} 
                  alt={`Upload ${i}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-white rounded-tl-md py-0.5 px-1 flex items-center text-xs font-medium">
                  <Star size={12} className="text-yellow-500 fill-current" />
                  <span className="ml-0.5">{4 + (i % 2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              {t('profile.noContributions')}
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              {t('upload.title')}
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
