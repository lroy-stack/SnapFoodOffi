import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import supabaseService from '../services/supabaseService';
import profileService from '../services/ProfileService';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { signUp, signInWithGoogle, signInWithApple } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setErrorMessage(language === 'de' 
        ? 'Bitte alle Felder ausfüllen' 
        : 'Please fill out all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage(language === 'de' 
        ? 'Passwörter stimmen nicht überein' 
        : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(language === 'de' 
        ? 'Passwort muss mindestens 6 Zeichen lang sein' 
        : 'Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const { user, error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('email already registered')) {
          setErrorMessage(language === 'de' 
            ? 'Diese E-Mail-Adresse ist bereits registriert' 
            : 'This email is already registered');
        } else {
          setErrorMessage(error.message);
        }
      } else if (user) {
        // Automatisch einen Benutzernamen generieren
        const usernameBase = email.split('@')[0];
        // Zufälligen Suffix hinzufügen, um Duplikate zu vermeiden
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const username = `${usernameBase}_${randomSuffix}`;
        
        // Anfängliches Benutzerprofil erstellen
        try {
          await profileService.createProfile(
            user.id,
            username,
            null, // displayName (wird standardmäßig Benutzername verwenden)
            language as 'de' | 'en'
          );
        } catch (profileError) {
          console.error(language === 'de' ? 'Fehler beim Erstellen des Profils' : 'Error creating profile:', profileError);
          // Registrierung nicht blockieren, wenn die Profilerstellung fehlschlägt
          // Dies wird erneut versucht, wenn der Benutzer seine E-Mail bestätigt
        }
        
        setSuccess(true);
      }
    } catch (error) {
      setErrorMessage(language === 'de' 
        ? 'Ein Fehler ist aufgetreten' 
        : 'An error occurred');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      // Redirect is handled by Supabase
    } catch (error) {
      console.error('Google signup error:', error);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      await signInWithApple();
      // Redirect is handled by Supabase
    } catch (error) {
      console.error('Apple signup error:', error);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendLoading || !email) return;
    
    setResendLoading(true);
    
    try {
      const { error } = await supabaseService.resendConfirmationEmail(email);
      
      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000); // Reset after 5 seconds
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      setErrorMessage(language === 'de'
        ? 'Fehler beim Senden der Bestätigungs-E-Mail'
        : 'Error sending confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-500" size={28} />
            </div>
            <h2 className="text-xl font-medium mb-2">
              {language === 'de' ? 'Registrierung erfolgreich!' : 'Registration successful!'}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'de'
                ? `Wir haben eine Bestätigungs-E-Mail an ${email} gesendet. Bitte klicke auf den Link in der E-Mail, um deine Registrierung abzuschließen.`
                : `We've sent a confirmation email to ${email}. Please click the link in the email to complete your registration.`}
            </p>
            <div className="text-amber-700 bg-amber-50 p-3 rounded-md mb-4 text-sm">
              <p>
                {language === 'de'
                  ? 'Hinweis: Die Bestätigungs-E-Mail kann einige Minuten in Anspruch nehmen. Bitte überprüfe auch deinen Spam-Ordner.'
                  : 'Note: The confirmation email may take a few minutes to arrive. Please also check your spam folder.'}
              </p>
            </div>
            
            {resendSuccess ? (
              <div className="text-green-700 mb-4">
                {language === 'de'
                  ? 'Bestätigungs-E-Mail erneut gesendet!'
                  : 'Confirmation email resent!'}
              </div>
            ) : (
              <button
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                className="mb-4 text-blue-600 hover:underline flex items-center justify-center mx-auto"
              >
                {resendLoading ? (
                  <RefreshCw className="animate-spin h-4 w-4 mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                {language === 'de' ? 'Bestätigungs-E-Mail erneut senden' : 'Resend confirmation email'}
              </button>
            )}
            
            <Link
              to="/login"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition inline-block"
            >
              {language === 'de' ? 'Zur Anmeldung' : 'Go to login'}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {language === 'de' ? 'Registrieren' : 'Sign Up'}
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Email/Password Form */}
          <form onSubmit={handleSignUp} className="mb-6">
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
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'de' ? 'Passwort' : 'Password'}
              </label>
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
                  placeholder={language === 'de' ? 'Mindestens 6 Zeichen' : 'At least 6 characters'}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'de' ? 'Passwort bestätigen' : 'Confirm Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={language === 'de' ? 'Passwort wiederholen' : 'Repeat password'}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                language === 'de' ? 'Registrieren' : 'Sign Up'
              )}
            </button>
          </form>
          
          {/* Social signup - promoted to top for more visibility */}
          <div className="space-y-3 mb-6">
            <p className="text-center text-gray-600 mb-2">
              {language === 'de'
                ? 'Schnelle Registrierung ohne E-Mail-Bestätigung:'
                : 'Quick registration without email verification:'}
            </p>
            <button
              onClick={handleGoogleSignUp}
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
              onClick={handleAppleSignUp}
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
              {language === 'de' ? 'oder mit E-Mail' : 'or with email'}
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md mb-6 text-sm text-amber-700">
            <p>
              {language === 'de'
                ? 'Hinweis: Bei der Registrierung per E-Mail kann es einige Minuten dauern, bis die Bestätigungs-E-Mail eintrifft.'
                : 'Note: When registering with email, it may take a few minutes for the confirmation email to arrive.'}
            </p>
          </div>
        </div>
        
        {/* Sign in link with magic link promotion */}
        <div className="text-center mt-6">
          <p className="text-gray-600 mb-2">
            {language === 'de' ? 'Bereits ein Konto?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-red-600 font-medium hover:underline">
              {language === 'de' ? 'Anmelden' : 'Sign in'}
            </Link>
          </p>
          
          <p className="text-sm text-gray-500">
            {language === 'de'
              ? 'Tipp: Nutze beim Login den "Magic Link" für eine schnellere Anmeldung ohne Passwort.'
              : 'Tip: Use the "Magic Link" option at login for faster authentication without a password.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
