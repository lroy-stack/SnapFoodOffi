import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { LanguageType } from '../../types';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const toggleLanguage = () => {
    const newLanguage: LanguageType = language === 'en' ? 'de' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
      aria-label={language === 'en' ? 'Switch to German' : 'Switch to English'}
    >
      {language === 'en' ? (
        <span className="text-sm font-bold leading-none bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">DE</span>
      ) : (
        <span className="text-sm font-bold leading-none bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">EN</span>
      )}
    </button>
  );
};

export default LanguageSwitcher;
