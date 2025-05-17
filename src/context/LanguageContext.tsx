import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n'; // Direct import of i18n instance
import { LanguageType } from '../types';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {}
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t } = useTranslation(); // Only get the translation function
  const [language, setLanguageState] = useState<LanguageType>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
      i18n.changeLanguage(savedLanguage); // Use directly imported i18n
    } else {
      const browserLang = navigator.language.split('-')[0];
      const detectedLang = browserLang === 'de' ? 'de' : 'en';
      setLanguageState(detectedLang);
      i18n.changeLanguage(detectedLang); // Use directly imported i18n
    }
  }, []);

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang); // Use directly imported i18n
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;