import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, AlertTriangle, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage(language === 'de' 
        ? 'Bitte gib deine E-Mail-Adresse ein' 
        : 'Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setErrorMessage(language === 'de' 
        ? 'Ein Fehler ist aufgetreten' 
        : 'An error occurred');
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {language === 'de' ? 'Passwort zurücksetzen' : 'Reset Password'}
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
        
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-500" size={28} />
            </div>
            <h2 className="text-xl font-medium mb-2">
              {language === 'de' ? 'Überprüfe deine E-Mails' : 'Check your email'}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'de' 
                ? `Wir haben einen Link zum Zurücksetzen deines Passworts an ${email} gesendet.` 
                : `We've sent a password reset link to ${email}.`}
            </p>
            <Link 
              to="/login" 
              className="text-red-600 font-medium hover:underline"
            >
              {language === 'de' ? 'Zurück zur Anmeldung' : 'Back to login'}
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">
              {language === 'de' 
                ? 'Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen deines Passworts zu erhalten.' 
                : 'Enter your email address to receive a link to reset your password.'}
            </p>
            
            <form onSubmit={handleResetPassword}>
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
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  language === 'de' ? 'Link zum Zurücksetzen senden' : 'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        )}
        
        {/* Back to login link */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-gray-600 hover:underline">
            {language === 'de' ? 'Zurück zur Anmeldung' : 'Back to login'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;