import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationEN from '../locales/en/translation.json';
import translationDE from '../locales/de/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  de: {
    translation: translationDE
  }
};

const getUserLanguage = (): 'de' | 'en' => {
  // Try to get from localStorage first
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage === 'de' || savedLanguage === 'en') {
    return savedLanguage;
  }

  // Try to detect from browser
  const browserLanguage = navigator.language.split('-')[0];
  if (browserLanguage === 'de') {
    return 'de';
  }

  // Default to English
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getUserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;