import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Camera, Check, PencilLine, User as UserIcon } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { storageService } from '../../services/StorageService';
import { profileService } from '../../services/ProfileService';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { LanguageType } from '../../types';
import { UserProfile } from '../../services/ProfileFallbackService';
import AlertBanner from '../common/AlertBanner';

interface ProfileEditorProps {
  onClose?: () => void;
  onUpdate?: (profile: UserProfile) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onClose, onUpdate }) => {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useContext(AuthContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>(language);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [usernameEditing, setUsernameEditing] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Inicializar formulario con datos del perfil
  useEffect(() => {
    if (profile) {
      setUsername(profile.benutzername || '');
      setDisplayName(profile.anzeigename || '');
      setAvatarUrl(profile.profilbild_url);
      // Asegurarse de que el idioma sea válido (de o en)
      const validLanguage = profile.sprache === 'de' || profile.sprache === 'en' 
        ? profile.sprache 
        : language;
      
      setSelectedLanguage(validLanguage);
    }
  }, [profile, language]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!profile) return;
    
    const hasChanges = 
      username !== profile.benutzername ||
      displayName !== profile.anzeigename ||
      selectedLanguage !== profile.sprache ||
      newAvatarFile !== null;
    
    setFormChanged(hasChanges);
  }, [username, displayName, selectedLanguage, newAvatarFile, profile]);

  // Comprobar disponibilidad del nombre de usuario
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username === profile?.benutzername) {
        setUsernameAvailable(true);
        return;
      }
      
      if (username.length < 3) {
        setUsernameAvailable(false);
        return;
      }
      
      setUsernameChecking(true);
      try {
        const { data, error } = await supabase
          .from('benutzer_profil')
          .select('benutzername')
          .eq('benutzername', username)
          .neq('auth_id', profile?.auth_id || '')
          .maybeSingle();
        
        if (error) throw error;
        
        // Disponible si no hay resultados
        setUsernameAvailable(!data);
      } catch (error) {
        console.error('Error al verificar nombre de usuario:', error);
        // Por defecto asumimos que está disponible para no bloquear al usuario
        setUsernameAvailable(true);
      } finally {
        setUsernameChecking(false);
      }
    };
    
    // Usar un debounce simple
    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username, profile]);

  // Manejar la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo y tamaño
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setError(t('profile.invalidImageType'));
      return;
    }
    
    if (file.size > maxSize) {
      setError(t('profile.imageTooLarge'));
      return;
    }
    
    setNewAvatarFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Subir la imagen de perfil usando el servicio especializado
  const uploadProfileImage = async (userId: string): Promise<string | null> => {
    if (!newAvatarFile) return avatarUrl;
    
    try {
      console.log('Iniciando subida de imagen de perfil para el usuario:', userId);
      
      // Usar el StorageService para subir la imagen
      const imageUrl = await storageService.uploadProfileImage(userId, newAvatarFile);
      
      if (!imageUrl) {
        throw new Error('No se pudo subir la imagen de perfil');
      }
      
      console.log('Imagen de perfil subida exitosamente:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error al subir imagen de perfil:', error);
      throw error;
    }
  };

  // Guardar cambios del perfil
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !formChanged) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let newAvatarUrl = avatarUrl;
      
      // Subir imagen si hay una nueva
      if (newAvatarFile) {
        const uploadedUrl = await uploadProfileImage(profile.auth_id);
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        } else {
          // Si falla la carga de la imagen, mostrar error pero continuar actualizando el resto del perfil
          console.warn('No se pudo subir la imagen, pero se actualizará el resto del perfil');
          setError('No se pudo subir la imagen de perfil, pero se actualizarán los demás datos');
        }
      }
      
      // Usar el ProfileService para actualizar el perfil
      const updated = await profileService.updateProfile({
        auth_id: profile.auth_id,
        benutzername: username,
        anzeigename: displayName,
        profilbild_url: newAvatarUrl,
        sprache: selectedLanguage
      });
      
      if (!updated) throw new Error('No se pudo actualizar el perfil');
      
      // Actualizar idioma si ha cambiado
      if (selectedLanguage !== language) {
        setLanguage(selectedLanguage);
      }
      
      // Actualizar caché de perfil
      await refreshProfile();
      
      // Mostrar mensaje de éxito
      setSuccess(t('profile.updateSuccess'));
      setNewAvatarFile(null);
      setNewAvatarPreview(null);
      setFormChanged(false);
      
      // Notificar al componente padre si existe
      if (onUpdate && profile) {
        onUpdate({
          ...profile,
          benutzername: username,
          anzeigename: displayName,
          profilbild_url: newAvatarUrl,
          sprache: selectedLanguage,
          aktualisiert_am: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setError(error.message || t('profile.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar la selección de archivo
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Eliminar la imagen seleccionada
  const handleRemoveSelectedImage = () => {
    setNewAvatarFile(null);
    setNewAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
        <h2 className="text-xl font-bold">{t('profile.editProfile')}</h2>
        <p className="text-red-100 text-sm">{t('profile.editProfileDesc')}</p>
      </div>
      
      {error && (
        <AlertBanner 
          message={error} 
          type="error" 
          onClose={() => setError(null)} 
          className="m-4"
        />
      )}
      
      {success && (
        <AlertBanner 
          message={success} 
          type="success" 
          onClose={() => setSuccess(null)} 
          className="m-4"
        />
      )}
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Imagen de perfil */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {newAvatarPreview ? (
                <img 
                  src={newAvatarPreview} 
                  alt={displayName || t('profile.profilePicture')} 
                  className="w-full h-full object-cover"
                />
              ) : avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName || t('profile.profilePicture')} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <UserIcon size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors"
            >
              <Camera size={18} />
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          
          {newAvatarPreview && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRemoveSelectedImage}
                className="text-red-600 text-sm flex items-center"
              >
                <X size={16} className="mr-1" />
                {t('profile.removeSelected')}
              </button>
            </div>
          )}
          
          <p className="text-gray-500 text-xs mt-2">
            {t('profile.imageRequirements')}
          </p>
        </div>
        
        {/* Campos del formulario */}
        <div className="space-y-6">
          {/* Nombre para mostrar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.displayName')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('profile.displayNamePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={30}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('profile.displayNameHelp')}
            </p>
          </div>
          
          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.username')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                disabled={!usernameEditing}
                placeholder={t('profile.usernamePlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg ${
                  usernameEditing 
                    ? (usernameAvailable ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : 'border-red-300 focus:ring-red-500 focus:border-red-500')
                    : 'border-gray-300 bg-gray-50'
                }`}
                maxLength={20}
              />
              
              {!usernameEditing ? (
                <button
                  type="button"
                  onClick={() => setUsernameEditing(true)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <PencilLine size={18} />
                </button>
              ) : (
                usernameChecking ? (
                  <span className="absolute right-3 top-2.5">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  </span>
                ) : (
                  <span className={`absolute right-3 top-2.5 ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                    {usernameAvailable ? <Check size={18} /> : <X size={18} />}
                  </span>
                )
              )}
            </div>
            
            <p className={`mt-1 text-sm ${
              usernameEditing && !usernameAvailable ? 'text-red-500' : 'text-gray-500'
            }`}>
              {usernameEditing && !usernameAvailable 
                ? t('profile.usernameNotAvailable') 
                : t('profile.usernameHelp')}
            </p>
          </div>
          
          {/* Idioma preferido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.language')}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        
        {/* Botones */}
        <div className="mt-8 flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !formChanged || (usernameEditing && !usernameAvailable)}
            className={`px-4 py-2 rounded-lg text-white flex items-center ${
              !formChanged || (usernameEditing && !usernameAvailable)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('common.saving')}
              </>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
