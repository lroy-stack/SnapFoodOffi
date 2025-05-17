import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Star, MapPin, Send, Loader, AlertCircle, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { GamificationContext } from '../contexts/GamificationContext';
import { dishes } from '../data/dishes';
import { restaurants } from '../data/restaurants';
import { BadgeNotification } from '../components/gamification/AchievementNotification';
import AlertBanner from '../components/common/AlertBanner';
import { supabase } from '../services/supabaseClient';

const Upload: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { user: authUser, profile, isLoading: authLoading } = useContext(AuthContext);
  const { user: gamificationUser, login: loginToUserContext, isLoggedIn: isUserLoggedIn } = useContext(UserContext);
  const { logActivity } = useContext(GamificationContext);
  
  const [selectedDish, setSelectedDish] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Sincronizar el contexto de usuario con el contexto de autenticación si es necesario
  useEffect(() => {
    if (authUser && !isUserLoggedIn) {
      loginToUserContext();
    }
  }, [authUser, isUserLoggedIn, loginToUserContext]);
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = authUser !== null;
  
  // Si está cargando la autenticación, mostrar un indicador de carga
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-24 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-10 h-10 text-red-600 animate-spin" />
          <p className="mt-4 text-gray-700">{t('login.loading', 'Cargando...')}</p>
        </div>
      </div>
    );
  }
  
  // Si el usuario no está autenticado, mostrar mensaje para iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <AlertCircle size={48} className="text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t('login.required')}</h2>
            <p className="text-gray-600 mb-6">
              {t('login.uploadMessage')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="/login" 
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('login.button')}
              </a>
              <a 
                href="/register" 
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('auth.signup')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar tamaño del archivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError(language === 'de' ? 
          'Datei zu groß. Maximale Größe: 5MB' : 
          'File too large. Maximum size: 5MB');
        return;
      }
      
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setFormError(language === 'de' ? 
          'Bitte wähle eine Bilddatei aus' : 
          'Please select an image file');
        return;
      }
      
      // Guardar el archivo y crear una URL para previsualización
      setPhotoFile(file);
      setPhotoUploaded(true);
      
      // Crear URL para previsualización
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setPhotoPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  // Validar el formulario
  const validateForm = (): boolean => {
    setFormError(null);
    
    if (!selectedDish) {
      setFormError(language === 'de' ? 
        'Bitte wähle ein Gericht aus' : 
        'Please select a dish');
      return false;
    }
    
    if (!selectedRestaurant) {
      setFormError(language === 'de' ? 
        'Bitte wähle ein Restaurant aus' : 
        'Please select a restaurant');
      return false;
    }
    
    if (rating === 0) {
      setFormError(language === 'de' ? 
        'Bitte bewerte deine Erfahrung' : 
        'Please rate your experience');
      return false;
    }
    
    if (!photoUploaded || !photoFile) {
      setFormError(language === 'de' ? 
        'Bitte lade ein Foto hoch' : 
        'Please upload a photo');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Simular la carga de la imagen a Supabase Storage
      console.log('Uploading photo:', photoFile?.name);
      
      // Crear un nombre de archivo único
      const fileName = `${authUser.id}_${selectedDish}_${Date.now()}.jpg`;
      const filePath = `public/${selectedRestaurant}/${fileName}`;
      
      console.log('📸 Subiendo foto a Supabase Storage:', filePath);
      
      // Subir la imagen a Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('dishes')
        .upload(filePath, photoFile as File);
      
      if (storageError) {
        console.error('❌ Error al subir la imagen:', storageError);
        throw storageError;
      }
      
      // Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase
        .storage
        .from('dishes')
        .getPublicUrl(filePath);
      
      const photoUrl = publicUrlData?.publicUrl;
      console.log('✅ Imagen subida correctamente. URL:', photoUrl);
      
      // Guardar la referencia de la foto en la base de datos
      const { error: dbError } = await supabase
        .from('fotos')
        .insert({
          benutzer_id: authUser.id,
          gericht_id: selectedDish,
          restaurant_id: selectedRestaurant,
          foto_url: photoUrl,
          beschreibung: comment || null,
          erstellt_am: new Date().toISOString()
        });
      
      if (dbError) {
        console.error('❌ Error al guardar referencia de foto en DB:', dbError);
        throw dbError;
      }
      
      console.log('✅ Referencia de foto guardada en base de datos');
      
      // Primero registramos la actividad de foto (5 puntos)
      const photoPoints = await logActivity('photo', { 
        dishId: selectedDish, 
        restaurantId: selectedRestaurant,
        photoUrl
      });
      
      console.log(`📊 Puntos por foto: ${photoPoints}`);
      
      // Luego registramos la actividad de reseña (1 punto)
      const reviewPoints = await logActivity('review', { 
        dishId: selectedDish, 
        restaurantId: selectedRestaurant, 
        rating,
        photoUrl
      });
      
      console.log(`📊 Puntos por reseña: ${reviewPoints}`);
      
      // Las insignias ahora se verifican automáticamente en el servicio mejorado
      // y se mostrarán a través del sistema de notificaciones del GamificationContext
      
      // Set submitted state
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      }, 1500);
    } catch (error) {
      console.error('Error submitting upload:', error);
      setIsSubmitting(false);
      setFormError(language === 'de' ? 
        'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' : 
        'An error occurred. Please try again.');
    }
  };
  
  // Reset the form
  const handleReset = () => {
    setSelectedDish('');
    setSelectedRestaurant('');
    setRating(0);
    setComment('');
    setPhotoUploaded(false);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setSubmitted(false);
    setFormError(null);
  };
  
  // Success animation variants
  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <div className="container mx-auto px-4 pt-20 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{t('upload.title')}</h1>
        
        {/* Información del usuario */}
        {profile && (
          <div className="mb-6 flex items-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              {profile.profilbild_url ? (
                <img 
                  src={profile.profilbild_url} 
                  alt={profile.anzeigename || profile.benutzername} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <span className="font-bold">
                  {(profile.anzeigename || profile.benutzername || '').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">{profile.anzeigename || profile.benutzername}</p>
              <p className="text-sm text-gray-500">{authUser?.email}</p>
            </div>
          </div>
        )}
        
        {/* Mensaje de error */}
        {formError && (
          <AlertBanner 
            type="error" 
            message={formError} 
            onClose={() => setFormError(null)} 
            className="mb-4"
          />
        )}
        
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-lg shadow-md p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold mb-2">
                {language === 'de' ? 'Erfolgreich geteilt!' : 'Successfully Shared!'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {language === 'de' 
                  ? 'Du hast 6 Punkte für deinen Beitrag erhalten. Danke fürs Teilen!' 
                  : 'You earned 6 points for your contribution. Thanks for sharing!'}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  {language === 'de' ? 'Noch eines teilen' : 'Share Another'}
                </button>
                
                <a
                  href="/discover"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center"
                >
                  {language === 'de' ? 'Entdecken' : 'Discover'}
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md"
            >
              {/* Dish selection */}
              <div className="p-5 border-b border-gray-100">
                <label className="block font-medium mb-2">{t('upload.selectDish')}</label>
                <select 
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">{t('upload.selectDishPrompt', 'Select a dish...')}</option>
                  {dishes.map(dish => (
                    <option key={dish.id} value={dish.id}>
                      {language === 'de' ? dish.nameDE : dish.nameEN}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Restaurant selection */}
              <div className="p-5 border-b border-gray-100">
                <label className="block font-medium mb-2">{t('upload.selectRestaurant')}</label>
                <select 
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">{t('upload.selectRestaurantPrompt', 'Select a restaurant...')}</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - {restaurant.district}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Photo upload */}
              <div className="p-5 border-b border-gray-100">
                <label className="block font-medium mb-2">{t('upload.addPhoto')}</label>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center relative overflow-hidden ${
                    photoUploaded ? 'border-green-500' : 'border-gray-300 hover:border-red-500'
                  }`}
                  style={{ minHeight: '200px' }}
                >
                  {photoPreviewUrl ? (
                    <div className="relative">
                      <img 
                        src={photoPreviewUrl} 
                        alt="Preview" 
                        className="max-h-[300px] mx-auto rounded-md object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoUploaded(false);
                          setPhotoFile(null);
                          setPhotoPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Camera size={48} className="mx-auto text-gray-400" />
                      <p className="mt-4 text-sm text-gray-500">
                        {t('upload.dragDropPhoto', 'Click to upload a photo or drag and drop')}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {t('upload.maxFileSize', 'Maximum file size: 5MB')}
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>
              
              {/* Rating */}
              <div className="p-5 border-b border-gray-100">
                <label className="block font-medium mb-2">{t('upload.rateExperience')}</label>
                <div className="flex space-x-2 items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transform transition hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={`${rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                  
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-medium">
                      {rating}/5
                    </span>
                  )}
                </div>
              </div>
              
              {/* Comment */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between mb-2">
                  <label className="block font-medium">{t('upload.comment')}</label>
                  <span className="text-xs text-gray-500">{t('upload.optional', 'Optional')}</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  placeholder={t('upload.commentPlaceholder', 'Share your thoughts about this dish...')}
                ></textarea>
              </div>
              
              {/* Submit button */}
              <div className="p-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      {t('upload.submit')}
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        {/* Badge Notification */}
        <BadgeNotification 
          badge={earnedBadge}
          visible={showBadgeNotification}
          onClose={() => setShowBadgeNotification(false)}
        />
      </div>
    </div>
  );
};

export default Upload;
