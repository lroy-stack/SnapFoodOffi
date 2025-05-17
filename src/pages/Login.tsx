import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { useConnectionStatus, ConnectionReason } from '../services/ConnectionService';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading,
    profileError,
    signIn, 
    signInWithGoogle, 
    signInWithApple, 
    signInWithMagicLink,
    refreshSession
  } = useContext(AuthContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/profile';
  
  // Estado de conexión
  const { isConnected, status, reason, reconnect } = useConnectionStatus();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Verificar sesión al cargar y redirigir si ya está autenticado
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      setIsLoading(true);
      
      try {
        // Si ya tenemos un usuario autenticado
        if (isAuthenticated) {
          console.log('✅ Usuario ya autenticado, redirigiendo a:', from);
          navigate(from);
          return;
        }
        
        // Si no hay usuario autenticado pero no hemos verificado la sesión
        if (!sessionChecked && !isAuthenticated) {
          console.log('🔄 Verificando sesión existente...');
          const hasValidSession = await refreshSession();
          
          if (hasValidSession) {
            console.log('✅ Sesión restaurada, redirigiendo a:', from);
            navigate(from);
          } else {
            console.log('ℹ️ No hay sesión activa, mostrando pantalla de login');
          }
          
          setSessionChecked(true);
        }
      } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [isAuthenticated, sessionChecked, navigate, from, refreshSession]);

  // Mostrar mensaje de error de perfil si existe
  useEffect(() => {
    if (profileError) {
      setErrorMessage(profileError);
    }
  }, [profileError]);

  // Mostrar error de conexión si es relevante
  useEffect(() => {
    if (!isConnected && reason === ConnectionReason.AUTH) {
      setErrorMessage(t('connection.authError', 'Error de autenticación. Por favor inicia sesión nuevamente.'));
    }
  }, [isConnected, reason, t]);

  // Función mejorada para inicio de sesión con email y contraseña
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar si hay problemas de conexión
    if (!isConnected) {
      try {
        await reconnect();
      } catch (error) {
        console.error('❌ Error al reconectar:', error);
        setErrorMessage(t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet.'));
        return;
      }
    }
    
    // Validar campos
    if (!email || !password) {
      setErrorMessage(t('auth.fieldsRequired', 'Por favor ingresa email y contraseña.'));
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('🔑 Iniciando sesión con email:', email);
      const { user, error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Error en inicio de sesión:', error);
        
        if (typeof error === 'object' && error !== null) {
          // Manejar diferentes tipos de errores
          if (error.message?.includes('Invalid login') || error.message?.includes('invalid credentials')) {
            setErrorMessage(t('auth.invalidCredentials', 'Email o contraseña incorrectos.'));
          } else if (error.message?.includes('Email not confirmed')) {
            setErrorMessage(t('auth.emailNotConfirmed', 'Por favor confirma tu email antes de iniciar sesión.'));
          } else if (error.message?.includes('network')) {
            setErrorMessage(t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet.'));
          } else {
            setErrorMessage(error.message || t('auth.unknownError', 'Ocurrió un error desconocido.'));
          }
        } else {
          setErrorMessage(t('auth.unknownError', 'Ocurrió un error desconocido.'));
        }
      } else if (user) {
        console.log('✅ Inicio de sesión exitoso, redirigiendo a:', from);
        navigate(from);
      }
    } catch (error) {
      console.error('❌ Error inesperado en inicio de sesión:', error);
      setErrorMessage(t('auth.unexpectedError', 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Función mejorada para inicio de sesión con Google
  const handleGoogleLogin = async () => {
    if (!isConnected) {
      try {
        await reconnect();
      } catch (error) {
        console.error('❌ Error al reconectar:', error);
        setErrorMessage(t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet.'));
        return;
      }
    }
    
    try {
      console.log('🔄 Iniciando sesión con Google...');
      await signInWithGoogle();
      // La redirección es manejada por el flujo OAuth de Supabase
    } catch (error) {
      console.error('❌ Error en inicio de sesión con Google:', error);
      setErrorMessage(t('auth.googleError', 'Error al iniciar sesión con Google.'));
    }
  };

  // Función mejorada para inicio de sesión con Apple
  const handleAppleLogin = async () => {
    if (!isConnected) {
      try {
        await reconnect();
      } catch (error) {
        console.error('❌ Error al reconectar:', error);
        setErrorMessage(t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet.'));
        return;
      }
    }
    
    try {
      console.log('🔄 Iniciando sesión con Apple...');
      await signInWithApple();
      // La redirección es manejada por el flujo OAuth de Supabase
    } catch (error) {
      console.error('❌ Error en inicio de sesión con Apple:', error);
      setErrorMessage(t('auth.appleError', 'Error al iniciar sesión con Apple.'));
    }
  };

  // Función mejorada para inicio de sesión con Magic Link
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      try {
        await reconnect();
      } catch (error) {
        console.error('❌ Error al reconectar:', error);
        setErrorMessage(t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet.'));
        return;
      }
    }
    
    if (!email) {
      setErrorMessage(t('auth.emailRequired', 'Por favor ingresa tu dirección de email.'));
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('📧 Enviando magic link a:', email);
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        console.error('❌ Error al enviar magic link:', error);
        setErrorMessage(error.message || t('auth.magicLinkError', 'Error al enviar el enlace de inicio de sesión.'));
      } else {
        console.log('✅ Magic link enviado exitosamente');
        setMagicLinkSent(true);
      }
    } catch (error) {
      console.error('❌ Error inesperado con magic link:', error);
      setErrorMessage(t('auth.unexpectedError', 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Si estamos cargando al inicializar
  if (isLoading && !sessionChecked) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-gray-600">
          {t('login.loading', 'Cargando...')}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 relative">
      {/* Notificación de problema de conexión */}
      {!isConnected && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg"
        >
          <div className="flex">
            <RefreshCw className="text-yellow-500 mr-2 animate-spin" size={20} />
            <div>
              <p className="text-yellow-700">
                {reason === ConnectionReason.NETWORK 
                  ? t('connection.networkError', 'Error de red. Comprueba tu conexión a Internet.')
                  : t('connection.unknownError', 'Error de conexión desconocido.')}
              </p>
              <button 
                onClick={reconnect}
                className="text-yellow-700 font-medium underline hover:text-yellow-800 text-sm"
              >
                {t('connection.reconnect', 'Reconectar')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {language === 'de' ? 'Anmelden' : 'Sign In'}
        </h1>
        
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
          >
            <div className="flex">
              <AlertTriangle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </motion.div>
        )}
        
        {magicLinkSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-green-500" size={28} />
            </div>
            <h2 className="text-xl font-medium mb-2">
              {language === 'de' ? 'Überprüfe deine E-Mails' : 'Check your email'}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'de' 
                ? `Wir haben einen Anmeldelink an ${email} gesendet.` 
                : `We've sent a login link to ${email}.`}
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-red-600 font-medium"
            >
              {language === 'de' ? 'Zurück zur Anmeldung' : 'Back to sign in'}
            </button>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Common email field for both auth methods */}
            <div className="mb-6">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'de' ? 'E-Mail' : 'Email'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={language === 'de' ? 'deine@email.com' : 'your@email.com'}
                  />
                </div>
              </div>
            </div>

            {/* Magic link - most prominent */}
            <div className="mb-6">
              <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-blue-700 mb-1 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" />
                    {language === 'de'
                      ? 'Schnellere Anmeldung mit Magic Link'
                      : 'Faster login with Magic Link'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {language === 'de'
                      ? 'Empfohlen: Wir senden dir einen Link per E-Mail, mit dem du dich sofort ohne Passwort anmelden kannst.'
                      : 'Recommended: We will send you a link by email that allows you to sign in instantly without a password.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={18} />
                      {language === 'de' ? 'Magic Link an E-Mail senden' : 'Send Magic Link to Email'}
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Social login */}
            <div className="space-y-3 mb-6">
              <p className="text-center text-sm text-gray-600 mb-2">
                {language === 'de'
                  ? 'Oder anmelden mit:'
                  : 'Or sign in with:'}
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {language === 'de' ? 'Mit Google fortfahren' : 'Continue with Google'}
              </button>
              
              <button
                onClick={handleAppleLogin}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.3,0c0.4,2.4-0.7,4.7-2.1,6c-1.4,1.3-3.4,2.3-5.1,2.1c-0.4-2.3,0.7-4.6,2.1-6.1 C12.6,0.8,14.6-0.2,16.3,0z"></path>
                  <path d="M22,17.7c-0.5,1.2-0.8,1.8-1.5,2.8c-1,1.5-2.4,3.3-4.3,3.3c-1.6,0-2-0.9-4.2-0.9c-2.2,0-2.7,0.9-4.2,1c-1.8,0-3.1-1.6-4.2-3.1 C0.8,17.2,0.1,13,1.6,10.1C2.5,8.2,4.4,7,6.4,7c1.8,0,3,1,4,1c1,0,1.8-1,4-1c1.7,0,3.3,0.8,4.2,2.3C15.6,9.9,16.7,16.4,22,17.7 L22,17.7z"></path>
                </svg>
                {language === 'de' ? 'Mit Apple fortfahren' : 'Continue with Apple'}
              </button>
            </div>
            
            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-500 text-sm">
                {language === 'de' ? 'oder mit Passwort' : 'or with password'}
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            {/* Password login is now less prominent */}
            <form onSubmit={handleEmailPasswordLogin} className="mb-2">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {language === 'de' ? 'Passwort' : 'Password'}
                  </label>
                  <Link to="/reset-password" className="text-sm text-red-600 hover:underline">
                    {language === 'de' ? 'Passwort vergessen?' : 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={language === 'de' ? 'Dein Passwort' : 'Your password'}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  language === 'de' ? 'Mit Passwort anmelden' : 'Sign In with Password'
                )}
              </button>
            </form>
          </div>
        )}
        
        {/* Sign up link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {language === 'de' ? 'Noch kein Konto?' : 'Don\'t have an account?'}{' '}
            <Link to="/register" className="text-red-600 font-medium hover:underline">
              {language === 'de' ? 'Registrieren' : 'Sign up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
